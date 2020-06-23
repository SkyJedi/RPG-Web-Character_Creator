import { get } from 'lodash-es';
import React from 'react';
import { connect } from 'react-redux';
import {
    Button,
    Col,
    FormGroup,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row
} from 'reactstrap';
import { bindActionCreators } from 'redux';
import { changeData } from '../redux/actions';
import { maxCareerSkills } from '../selectors';
import { Description } from './index';

class CareerComponent extends React.Component {
    handleChange = event => {
        const {
            archetypeSpecialSkills = {},
            careers,
            archetype,
            archetypes
        } = this.props;
        const skill = Object.keys(archetypeSpecialSkills).filter(
            key => careers[event.target.value].skills.includes(key) && key
        );
        if (skill.length > 0 && archetype === 'AverageHuman') {
            alert(
                `${
                    careers[event.target.value].name
                } career contains ${skill.join(' ')}, which ${get(
                    archetypes,
                    `${archetype}.name`,
                    'your selected Archetype'
                )} has modified. Please select a different career or change the skill options in Archetype selection`
            );
            return;
        }
        this.props.changeData(event.target.value, 'career');
        this.props.changeData([], 'careerSkillsRank');
        event.preventDefault();
    };

    handleCheck = event => {
        let arr = [...this.props.careerSkillsRank];
        if (arr.includes(event.target.name)) {
            arr.forEach((skill, index) => {
                if (arr[index] === event.target.name) arr.splice(index, 1);
            });
        } else arr.push(event.target.name);
        if (this.props.maxCareerSkills >= arr.length)
            this.props.changeData(arr, 'careerSkillsRank');
        else event.preventDefault();
    };

    render() {
        const {
            career,
            careers,
            skills,
            careerSkillsRank,
            modal,
            handleClose,
            theme
        } = this.props;
        const masterCareer = careers[career];
        return (
            <Modal
                className={`body-${theme}`}
                isOpen={modal}
                toggle={handleClose}
            >
                <ModalHeader toggle={handleClose}>
                    <b>Select Career</b>
                </ModalHeader>
                <ModalBody>
                    <Input
                        type="select"
                        bsSize="sm"
                        value={masterCareer ? masterCareer.name : ''}
                        onChange={this.handleChange}
                    >
                        <option value={null} />
                        {Object.keys(careers)
                            .sort()
                            .map(key => (
                                <option value={key} key={key}>
                                    {careers[key].name}
                                </option>
                            ))}
                    </Input>
                    <hr />

                    {masterCareer && (
                        <ModalBody>
                            <Row>
                                <h5>Career Skills</h5>
                            </Row>
                            <Row>
                                Select {this.props.maxCareerSkills} skills to
                                start with 1 free rank
                            </Row>
                            {masterCareer.skills.sort().map(skill => (
                                <Row
                                    key={skill}
                                    className="ml-3 align-items-center"
                                >
                                    <FormGroup check>
                                        <Input
                                            type="checkbox"
                                            name={skill}
                                            id={skill}
                                            className="my-2"
                                            checked={careerSkillsRank.includes(
                                                skill
                                            )}
                                            onChange={this.handleCheck}
                                        />
                                        <Label id={skill} check>
                                            {skills[skill]
                                                ? skills[skill].name
                                                : 'Skill not found'}
                                        </Label>
                                    </FormGroup>
                                </Row>
                            ))}

                            <Row className="mb-1 align-self-center">
                                <Label for="setting" sm="3" className="py-0">
                                    <b>Setting</b>
                                </Label>
                                <Col id="setting" sm="auto">
                                    {Array.isArray(masterCareer.setting)
                                        ? masterCareer.setting.sort().join(', ')
                                        : masterCareer.setting}
                                </Col>
                            </Row>
                            {masterCareer.book && (
                                <Row className="mb-1 align-self-center">
                                    <Label for="book" sm="3" className="py-0">
                                        <b>Book</b>
                                    </Label>
                                    <Col sm="auto">
                                        <Description
                                            id="book"
                                            text={`${masterCareer.book}: ${masterCareer.page}`}
                                        />
                                    </Col>
                                </Row>
                            )}
                            <Row className="mb-1 align-self-center">
                                <Label for="desc" className="py-0" sm="3">
                                    <b>Description</b>
                                </Label>
                                <Col sm="auto">
                                    <Description
                                        id="desc"
                                        text={masterCareer.description}
                                    />
                                </Col>
                            </Row>
                        </ModalBody>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </ModalFooter>
            </Modal>
        );
    }
}

const mapStateToProps = state => {
    return {
        archetype: state.archetype,
        archetypes: state.archetypes,
        career: state.career,
        careerSkillsRank: state.careerSkillsRank,
        careers: state.careers,
        skills: state.skills,
        maxCareerSkills: maxCareerSkills(state),
        theme: state.theme,
        archetypeSpecialSkills: state.archetypeSpecialSkills
    };
};

const matchDispatchToProps = dispatch =>
    bindActionCreators({ changeData }, dispatch);

export const Career = connect(
    mapStateToProps,
    matchDispatchToProps
)(CareerComponent);
