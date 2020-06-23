import { get, upperCase } from 'lodash-es';
import React from 'react';
import { connect } from 'react-redux';
import {
    Button,
    ButtonGroup,
    Col,
    Input,
    InputGroupAddon,
    Label,
    Row
} from 'reactstrap';
import { bindActionCreators } from 'redux';
import * as images from '../images';
import {
    addDataSet,
    changeDocData,
    changeFieldData,
    changeReduxState,
    removeDataSet
} from '../redux/actions';
import { ModalDeleteConfirm } from './';

class VehicleSelectComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentSystemStrain: props.currentSystemStrain,
            currentHullTrauma: props.currentHullTrauma,
            vehicleNotes: props.vehicleNotes,
            deleteModal: false,
            name: get(props.vehicleDataSet, `${props.vehicle}.name`, ''),
            writeAccess: get(
                props.vehicleDataSet,
                `${props.vehicle}.write`,
                []
            ).includes(props.user)
        };
    }

    componentWillReceiveProps(nextProps) {
        const {
            vehicle,
            currentHullTrauma,
            currentSystemStrain,
            vehicleNotes
        } = this.props;
        if (nextProps.vehicle !== vehicle) {
            this.setState({
                name: get(
                    nextProps.vehicleDataSet,
                    `${nextProps.vehicle}.name`,
                    ''
                )
            });
        }
        if (nextProps.currentHullTrauma !== currentHullTrauma)
            this.setState({ currentHullTrauma: nextProps.currentHullTrauma });
        if (nextProps.currentSystemStrain !== currentSystemStrain)
            this.setState({
                currentSystemStrain: nextProps.currentSystemStrain
            });
        if (nextProps.vehicleNotes !== vehicleNotes)
            this.setState({ vehicleNotes: nextProps.vehicleNotes });
    }

    handleChange = event => {
        event.preventDefault();
        if (event.target.id === 'number')
            event.target.value = +event.target.value;
        this.setState({ [event.target.name]: event.target.value });
    };

    handleSubmit = event => {
        event.preventDefault();
        let { value, name, id } = event.target;
        if (id === 'number') value = +value;
        this.props.changeDocData('vehicle', this.props.vehicle, name, value);
    };

    handleSelect = event => {
        event.preventDefault();
        this.props.changeReduxState(event.target.value, 'vehicle');
    };

    confirmedDelete = event => {
        this.props.removeDataSet('vehicle', this.props.vehicle);
        this.setState({ deleteModal: false });
        event.preventDefault();
    };

    render() {
        const {
            vehicle,
            vehicles,
            addDataSet,
            vehicleDataSet,
            theme,
            vehicleType,
            changeFieldData
        } = this.props;
        const { name, vehicleNotes, deleteModal, writeAccess } = this.state;
        return (
            <div>
                <Row className="justify-content-end">
                    <div className={`header header-${theme}`}>VEHICLES</div>
                </Row>
                <hr />
                <Row className="align-items-center">
                    <Label sm={2}>
                        <b>VEHICLE</b>
                    </Label>
                    <Col sm={4}>
                        <Input
                            type="select"
                            bsSize="sm"
                            disabled={0 >= Object.keys(vehicleDataSet).length}
                            value={vehicle}
                            onChange={this.handleSelect}
                        >
                            {Object.keys(vehicleDataSet).map(key => (
                                <option value={key} key={key}>
                                    {vehicleDataSet[key].name
                                        ? vehicleDataSet[key].name
                                        : 'Unnamed Vehicle'}
                                </option>
                            ))}
                        </Input>
                    </Col>
                    <Col sm={2}>
                        <InputGroupAddon addonType="append">
                            <ButtonGroup>
                                <Button onClick={() => addDataSet('vehicle')}>
                                    New
                                </Button>
                                <Button
                                    disabled={!vehicle || !writeAccess}
                                    onClick={() =>
                                        this.setState({ deleteModal: true })
                                    }
                                >
                                    Delete
                                </Button>
                            </ButtonGroup>
                        </InputGroupAddon>
                    </Col>
                </Row>
                <hr />
                {!writeAccess && (
                    <Row>
                        <b>READ-ONLY</b>
                    </Row>
                )}
                <Row>
                    <Label sm={2}>
                        <b>NAME</b>
                    </Label>
                    <Col sm={6}>
                        <Input
                            type="text"
                            name="name"
                            bsSize="sm"
                            disabled={!vehicle || !writeAccess}
                            value={name ? name : ''}
                            maxLength="50"
                            onChange={this.handleChange}
                            onBlur={() =>
                                changeFieldData(
                                    'vehicle',
                                    vehicle,
                                    name,
                                    'name'
                                )
                            }
                        />
                    </Col>
                </Row>
                <hr />
                <Row className="align-items-center">
                    <Label sm={2}>
                        <b>TYPE</b>
                    </Label>
                    <Col sm={6}>
                        <Input
                            type="select"
                            bsSize="sm"
                            disabled={!vehicle || !writeAccess}
                            name="vehicleType"
                            value={vehicleType}
                            onChange={this.handleSubmit}
                        >
                            <option value="" />
                            {vehicles &&
                                Object.keys(vehicles).map(key => (
                                    <option value={key} key={key}>
                                        {vehicles[key].name
                                            ? vehicles[key].name
                                            : 'Unnamed Vehicle'}
                                    </option>
                                ))}
                        </Input>
                    </Col>
                </Row>
                <hr />
                <div className="VehicleStatBlock justify-content-center">
                    <img
                        src={images[theme].VehicleStatBlock}
                        alt=""
                        className="svg"
                    />
                    {[
                        'silhouette',
                        'maxSpeed',
                        'handling',
                        'defense',
                        'armor',
                        'hullTraumaThreshold',
                        'systemStrainThreshold'
                    ].map(type => (
                        <div
                            key={type}
                            className={`vehicleStat vehicleStat-${type}`}
                        >
                            {vehicles[vehicleType] &&
                                vehicles[vehicleType][type]}
                        </div>
                    ))}
                    {['currentHullTrauma', 'currentSystemStrain'].map(type => (
                        <Input
                            key={type}
                            type="number"
                            bsSize="sm"
                            name={type}
                            id="number"
                            maxLength="2"
                            disabled={!vehicle || !writeAccess}
                            className={`vehicleStat vehicleStat-${type} px-1 pt-1`}
                            onChange={this.handleChange}
                            onBlur={this.handleSubmit}
                            value={this.state[type] > 0 ? this.state[type] : ''}
                        />
                    ))}
                </div>
                {[
                    'skill',
                    'complement',
                    'passengerCapacity',
                    'price',
                    'rarity',
                    'consumables',
                    'encumbranceCapacity'
                ].map(type => (
                    <Row key={type} className="align-items-center mb-1">
                        <Label for={type} sm="auto">
                            <b>{`${upperCase(type)}:`}</b>
                        </Label>
                        <Col id={type}>
                            {vehicles[vehicleType] &&
                                vehicles[vehicleType][type]}
                        </Col>
                    </Row>
                ))}
                <Row className="align-items-top mb-1">
                    <Label for={'weapons'} sm="auto">
                        <b>{`WEAPONS:`}</b>
                    </Label>
                    <Col id={'weapons'} className="text-pre">
                        {vehicles[vehicleType] && vehicles[vehicleType].weapons}
                    </Col>
                </Row>
                <Row className="align-items-top mb-1">
                    <Label sm="auto" for="features">
                        <b>NOTES</b>
                    </Label>
                    <Col>
                        <Input
                            onChange={this.handleChange}
                            onBlur={this.handleSubmit}
                            type="textarea"
                            rows="12"
                            className="w-100 my-auto"
                            maxLength="1000"
                            name="vehicleNotes"
                            disabled={!vehicle || !writeAccess}
                            id="text"
                            value={vehicleNotes}
                        />
                    </Col>
                </Row>
                <ModalDeleteConfirm
                    deleteModal={deleteModal}
                    confirmedDelete={this.confirmedDelete}
                    handleClose={() => this.setState({ deleteModal: false })}
                    type="Vehicle"
                />
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        user: state.user,
        theme: state.theme,
        vehicle: state.vehicle,
        vehicles: state.vehicles,
        vehicleDataSet: state.vehicleDataSet,
        vehicleType: state.vehicleType,
        currentHullTrauma: state.currentHullTrauma,
        currentSystemStrain: state.currentSystemStrain,
        vehicleNotes: state.vehicleNotes
    };
};

const matchDispatchToProps = dispatch =>
    bindActionCreators(
        {
            addDataSet,
            changeReduxState,
            removeDataSet,
            changeFieldData,
            changeDocData
        },
        dispatch
    );

export const VehicleSelect = connect(
    mapStateToProps,
    matchDispatchToProps
)(VehicleSelectComponent);
