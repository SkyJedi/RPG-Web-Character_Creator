import clone from 'clone';
import { startCase } from 'lodash-es';
import React from 'react';
import { connect } from 'react-redux';
import {
    Button,
    ButtonGroup,
    Col,
    Input,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row
} from 'reactstrap';
import { bindActionCreators } from 'redux';
import { chars, modifiableAttributes } from '../data';
import { changeData } from '../redux/actions';
import { talentCount } from '../selectors';
import { Description, TalentDedication } from './index';

class TalentSelectionComponent extends React.Component {
    state = {
        talentSelection: this.props.talentKey,
        selection: this.props.talentModifiers.Dedication[this.props.row]
            ? this.props.talentModifiers.Dedication[this.props.row]
            : ''
    };

    makeOptions = () => {
        const { tier, talentCount, talentKey, talents } = this.props;
        return Object.keys(talents)
            .map(key => {
                if (tier === 5 && key === 'Dedication') return key;
                if (key === talentKey) return key;
                //check for antirequisite
                if (
                    talents[key].antirequisite &&
                    talentCount[talents[key].antirequisite]
                )
                    return false;
                //check for prerequisite
                if (
                    talents[key].prerequisite &&
                    !talentCount[talents[key].prerequisite]
                )
                    return false;
                //talent from this tier and has not been selected already
                if (+talents[key].tier > +tier) return false;
                if (+talents[key].tier === +tier && talentCount[key])
                    return false;
                if (+talents[key].tier < +tier && !talents[key].ranked)
                    return false;
                //talent is ranked and has been selected enough for this tier
                if (
                    talents[key].ranked && talentCount[key]
                        ? +tier !== +talents[key].tier + talentCount[key]
                        : false
                )
                    return false;
                return key;
            })
            .sort()
            .filter(Boolean);
    };

    handleClear = () => {
        const { row, tier, masterTalents, changeData } = this.props;
        this.setState({ talentSelection: '', selection: '' });
        let obj = clone(masterTalents);
        obj[row][tier] = '';
        changeData(obj, 'masterTalents');
    };

    handleSubmit = () => {
        const {
            row,
            tier,
            masterTalents,
            talentModifiers,
            changeData,
            handleClose
        } = this.props;
        const { talentSelection, selection } = this.state;
        let obj = clone(masterTalents);
        obj[row][tier] = talentSelection;
        //if the new talents isn't blank make a new empty block
        if (talentSelection !== '') {
            //select tier 1 talent, add the next tier 1 row
            if (tier === 1 && !obj[row + 1]) obj[row + 1] = { 1: '' };
            //if the row allows, add the next tier
            if (row > tier && 5 > tier) {
                if (
                    masterTalents[row - 1][tier + 1] !== '' &&
                    !obj[row][tier + 1]
                )
                    obj[row][tier + 1] = '';
            }
            //add the same tier in the next row if it wasn't allowed in a previous select
            if (masterTalents[row + 1]) {
                if (!masterTalents[row + 1][tier]) {
                    if (
                        masterTalents[row + 1][tier - 1] &&
                        masterTalents[row + 1][tier - 1] !== ''
                    )
                        obj[row + 1][tier] = '';
                }
            }
        }

        changeData(obj, 'masterTalents');
        //add dedication info to talentModifiers
        if (selection !== '') {
            let obj2 = clone(talentModifiers);
            obj2.Dedication[row] = selection;
            changeData(obj2, 'talentModifiers');
        }
        handleClose();
    };

    activation = () => {
        const { talents } = this.props;
        const { talentSelection } = this.state;
        if (talentSelection === '') return 'var(--light)';
        if (!talents[talentSelection]) return 'var(--red)';
        if (talents[talentSelection].activation) return 'var(--orange)';
        else return 'var(--lightblue)';
    };

    handleClose = () => {
        this.setState({ talentSelection: '', selection: '' });
        this.props.handleClose();
    };

    render() {
        const { talents, row, modal, skills, theme } = this.props;
        const { talentSelection, selection } = this.state;
        const talent = talents[talentSelection];
        return (
            <Modal
                className={`body-${theme}`}
                isOpen={modal}
                toggle={this.handleClose}
            >
                <ModalHeader
                    toggle={this.handleClose}
                    style={{ backgroundColor: this.activation() }}
                >
                    Select a Talent
                </ModalHeader>
                <ModalBody className="m-4">
                    <Row>
                        <Input
                            type="select"
                            bsSize="sm"
                            value={talentSelection}
                            onChange={event =>
                                this.setState({
                                    talentSelection: event.target.value
                                })
                            }
                        >
                            <option value="" />
                            {this.makeOptions()
                                .sort()
                                .map(key => (
                                    <option value={key} key={key}>
                                        {talents[key] ? talents[key].name : ''}
                                    </option>
                                ))}
                        </Input>
                    </Row>
                    {talent && (
                        <div className="mt-2">
                            <Row>
                                <Col sm="4">
                                    <b>Name:</b>
                                </Col>
                                <Col>{talent.name}</Col>
                            </Row>
                            <Row>
                                <Col sm="4">
                                    <b>Tier:</b>
                                </Col>
                                <Col>{talent.tier}</Col>
                            </Row>
                            <Row>
                                <Col sm="4">
                                    <b>Activation:</b>
                                </Col>
                                <Col>
                                    {talent.activation ? 'Active' : 'Passive'}
                                </Col>
                            </Row>
                            {talent.turn && (
                                <Row>
                                    <Col sm="4" />
                                    <Col>{talent.turn}</Col>
                                </Row>
                            )}
                            {talent.ranked ? (
                                <Row>
                                    <Col sm="6">
                                        <b>Ranked</b>
                                    </Col>
                                </Row>
                            ) : (
                                <Row>
                                    <Col sm="6">
                                        <b>Not Ranked</b>
                                    </Col>
                                </Row>
                            )}
                            {talent.setting && (
                                <Row>
                                    <Col sm="4">
                                        <b>Setting:</b>
                                    </Col>
                                    <Col>
                                        {Array.isArray(talent.setting)
                                            ? talent.setting.sort().join(', ')
                                            : talent.setting}
                                    </Col>
                                </Row>
                            )}
                            {talent.book && (
                                <Row className="my-2">
                                    <Col sm="4">
                                        {' '}
                                        <b>Book:</b>
                                    </Col>
                                    <Col>
                                        <Description
                                            text={`${talent.book}: ${talent.page}`}
                                        />
                                    </Col>
                                </Row>
                            )}
                            {talent.prerequisite && (
                                <Row className="my-2">
                                    <Col sm="4">
                                        {' '}
                                        <b>Prerequisite Talent:</b>
                                    </Col>
                                    <Col className="m-auto">
                                        {talent.prerequisite}
                                    </Col>
                                </Row>
                            )}
                            {talent.antirequisite && (
                                <Row className="my-2">
                                    <Col sm="4">
                                        {' '}
                                        <b>Antirequisite Talent:</b>
                                    </Col>
                                    <Col className="m-auto">
                                        {talent.antirequisite}
                                    </Col>
                                </Row>
                            )}
                            {talent.modifier && (
                                <Row className="my-2">
                                    <Col sm="4">
                                        {' '}
                                        <b>Modifier:</b>
                                    </Col>
                                    {Object.keys(talent.modifier)[0] ===
                                        'careerSkills' && (
                                        <Col>
                                            Adds{' '}
                                            {talent.modifier.careerSkills
                                                .map(skill =>
                                                    skills[skill]
                                                        ? skills[skill].name
                                                        : skill
                                                )
                                                .sort()
                                                .join(', ')}{' '}
                                            as Career Skill(s)
                                        </Col>
                                    )}
                                    {Object.keys(skills).includes(
                                        Object.keys(talent.modifier)[0]
                                    ) && (
                                        <Col>
                                            <Description
                                                text={`Adds ${
                                                    Object.values(
                                                        talent.modifier
                                                    )[0]
                                                }  to ${
                                                    skills[
                                                        Object.keys(
                                                            talent.modifier
                                                        )[0]
                                                    ].name
                                                } checks.`}
                                            />
                                        </Col>
                                    )}
                                    {modifiableAttributes.includes(
                                        Object.keys(talent.modifier)[0]
                                    ) &&
                                        Object.keys(talent.modifier)[0] !==
                                            'careerSkills' && (
                                            <Col>
                                                Adds{' '}
                                                {
                                                    Object.values(
                                                        talent.modifier
                                                    )[0]
                                                }{' '}
                                                to{' '}
                                                {startCase(
                                                    Object.keys(
                                                        talent.modifier
                                                    )[0]
                                                )}
                                            </Col>
                                        )}
                                    {chars.includes(
                                        Object.keys(talent.modifier)[0]
                                    ) && (
                                        <Col>
                                            Increase{' '}
                                            {Object.keys(talent.modifier)[0]} by
                                            1
                                        </Col>
                                    )}
                                </Row>
                            )}
                            {talent.description && (
                                <Row>
                                    <Col sm="4">
                                        <b>Description:</b>
                                    </Col>
                                    <Col>
                                        <Description
                                            text={
                                                talent.description
                                                    ? talent.description
                                                    : ''
                                            }
                                        />
                                    </Col>
                                </Row>
                            )}
                            {talentSelection === 'Dedication' && (
                                <TalentDedication
                                    row={row}
                                    selection={selection}
                                    handleDedicationChange={name =>
                                        this.setState({ selection: name })
                                    }
                                />
                            )}
                        </div>
                    )}
                </ModalBody>

                <ModalFooter>
                    <ButtonGroup>
                        <Button color="warning" onClick={this.handleClear}>
                            Clear
                        </Button>

                        <Button
                            disabled={
                                talentSelection === 'Dedication' &&
                                selection === ''
                            }
                            onClick={this.handleSubmit}
                        >
                            Enter
                        </Button>
                    </ButtonGroup>
                </ModalFooter>
            </Modal>
        );
    }
}

const mapStateToProps = state => {
    return {
        masterTalents: state.masterTalents,
        talentCount: talentCount(state),
        talents: state.talents,
        talentModifiers: state.talentModifiers,
        skills: state.skills,
        theme: state.theme
    };
};

const matchDispatchToProps = dispatch =>
    bindActionCreators({ changeData }, dispatch);

export const TalentSelection = connect(
    mapStateToProps,
    matchDispatchToProps
)(TalentSelectionComponent);
