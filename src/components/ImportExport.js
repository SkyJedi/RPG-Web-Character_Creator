import { cloneDeep, pull, startCase } from 'lodash-es';
import React from 'react';
import { connect } from 'react-redux';
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    CardText,
    Col,
    Input,
    Label,
    Row
} from 'reactstrap';
import { bindActionCreators } from 'redux';
import { customDataTypes, dataTypes } from '../data/';
import { db } from '../firestoreDB';
import {
    addDataSet,
    importCharacter,
    importCustomData
} from '../redux/actions';

class ImportExportComponent extends React.Component {
    state = {
        characters: [],
        customArchetypes: [],
        customArchetypeTalents: [],
        customArmor: [],
        customCareers: [],
        customGear: [],
        customMotivations: [],
        customSettings: [],
        customSkills: [],
        customTalents: [],
        customVehicles: [],
        customWeapons: []
    };

    initState = () => {
        this.setState({
            characters: [],
            customArchetypes: [],
            customArchetypeTalents: [],
            customArmor: [],
            customCareers: [],
            customGear: [],
            customMotivations: [],
            customSettings: [],
            customSkills: [],
            customTalents: [],
            customVehicles: [],
            customWeapons: []
        });
    };

    generateFileName = () => {
        let time = new Date(Date.now())
            .toLocaleString()
            .replace(/[\s+]/g, '')
            .replace(/[\D+]/g, '_')
            .slice(0, -2);
        return `GenesysEmporiumExport_${time}.json`;
    };

    generateExport = async () => {
        const { user, characterList } = this.props;
        let final = {};
        Promise.all(
            Object.keys(this.state).map(async type => {
                if (0 >= this.state[type].length) return;
                return new Promise(resolve0 => {
                    switch (type) {
                        case 'characters':
                            const characters = this.state[type].map(
                                async character => {
                                    return new Promise(async resolve1 => {
                                        const file = {
                                            name: characterList[character]
                                        };
                                        Promise.all(
                                            dataTypes.map(async type => {
                                                return new Promise(
                                                    async resolve2 => {
                                                        db.doc(
                                                            `users/${user}/data/characters/${character}/${type}/`
                                                        )
                                                            .get()
                                                            .then(doc => {
                                                                if (doc.exists)
                                                                    file[
                                                                        type
                                                                    ] = cloneDeep(
                                                                        doc.data()
                                                                            .data
                                                                    );
                                                                resolve2();
                                                            });
                                                    }
                                                );
                                            })
                                        ).then(() => resolve1(file));
                                    });
                                }
                            );
                            Promise.all(characters).then(characters => {
                                final.characters = characters;
                                resolve0();
                            });
                            break;
                        default:
                            final[type] = this.state[type].map(key => {
                                // noinspection JSUnusedLocalSymbols
                                let { read, write, ...item } = this.props[type][
                                    key
                                ];
                                return item;
                            });
                            resolve0();
                            break;
                    }
                });
            })
        ).then(() => {
            const element = document.createElement('a');
            const file = new Blob([JSON.stringify(final)], {
                type: 'application/json'
            });
            element.href = URL.createObjectURL(file);
            element.download = this.generateFileName();
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
            this.initState();
        });
    };

    handleChange = event => {
        const { characterList } = this.props;
        const { characters } = this.state;
        let name = event.target.name;
        let value = event.target.value;

        if (name === 'characters') {
            let arr = [];
            if (value === 'all') {
                if (characters.length === Object.keys(characterList).length)
                    arr = [];
                else arr = Object.keys(characterList);
            } else {
                arr = cloneDeep(characters);
                if (arr.includes(value)) arr.splice(arr.indexOf(value), 1);
                else arr.push(value);
            }
            this.setState({ characters: arr });
        } else {
            let key = event.target.id;
            switch (true) {
                case value === 'all':
                    if (
                        customDataTypes.every(type =>
                            Object.keys(this.props[type]).every(key =>
                                this.state[type].includes(key)
                            )
                        )
                    ) {
                        customDataTypes.forEach(type =>
                            this.setState({ [type]: [] })
                        );
                    } else
                        customDataTypes.forEach(
                            type =>
                                this.props[type] &&
                                this.setState({
                                    [type]: Object.keys(this.props[type])
                                })
                        );
                    break;
                case customDataTypes.includes(value) && !key:
                    if (
                        Object.keys(this.props[value]).every(key =>
                            this.state[value].includes(key)
                        )
                    )
                        this.setState({ [value]: [] });
                    else
                        this.setState({
                            [value]: Object.keys(this.props[value])
                        });
                    break;
                default:
                    let data = [...this.state[value]];
                    if (this.state[value].includes(key)) data = pull(data, key);
                    else data.push(key);
                    this.setState({ [value]: data });
            }
        }
    };

    handleFile = event => {
        const fileInput = event.target.files[0];
        const reader = new FileReader();
        reader.onload = event => {
            let file = JSON.parse(event.target.result);
            //old exports Delete at some point
            if (Array.isArray(file)) {
                file.forEach(data => {
                    switch (Object.keys(data)[0]) {
                        case 'character':
                            this.props.importCharacter(
                                data.character,
                                this.props.user
                            );
                            alert(`${data.character.name} Imported!`);
                            break;
                        case 'customData':
                            this.props.importCustomData(data.customData);
                            alert(`Custom Data Imported!`);
                            break;
                        default:
                            alert('No Data Imported.');
                            break;
                    }
                });
            }
            //New exports
            else {
                let text = '';
                Object.keys(file).forEach(type => {
                    switch (type) {
                        case 'characters':
                            file[type].forEach(character => {
                                this.props.importCharacter(
                                    character,
                                    this.props.user
                                );
                                text += `${character.name} Imported!\n`;
                            });
                            break;
                        case 'customMotivations':
                        case 'customArchetypeTalents':
                        case 'customArchetypes':
                        case 'customArmor':
                        case 'customCareers':
                        case 'customGear':
                        case 'customSkills':
                        case 'customTalents':
                        case 'customVehicles':
                        case 'customWeapons':
                            file[type].forEach(data => {
                                if (
                                    Object.keys(this.props[type]).some(
                                        id => id === data.id
                                    )
                                ) {
                                    text += `${data.name}(${data.id}) not imported, already exists in database.\n`;
                                } else {
                                    this.props.addDataSet(type, data);
                                    text += `${startCase(
                                        type
                                    )} Data Imported.\n`;
                                }
                            });
                            break;
                        default:
                            text += `No ${startCase(type)} Data Imported.\n`;
                            break;
                    }
                });
                alert(text);
            }
        };
        reader.onerror = () => alert('Bad File');
        reader.readAsText(fileInput);
    };

    render() {
        const { characterList } = this.props;
        const { characters } = this.state;
        return (
            <div className="align-self-end align-self-middle">
                <Row>
                    <Button
                        className="m-2 align-middle"
                        onClick={this.generateExport}
                    >
                        Export Selected{' '}
                    </Button>{' '}
                    <Label
                        for="import"
                        className="btn-secondary py-2 px-3 m-2 align-middle rounded"
                    >
                        Import File
                    </Label>
                    <Input
                        type="file"
                        accept=".json"
                        onChange={this.handleFile}
                        id="import"
                        hidden
                    />
                </Row>
                <div>
                    <Row>
                        <Input
                            type="checkbox"
                            value="all"
                            name={'characters'}
                            checked={
                                characters.length ===
                                Object.keys(characterList).length
                            }
                            onChange={this.handleChange}
                        />{' '}
                        <h5 className="my-auto">All Characters</h5>
                    </Row>
                    <Row>
                        {Object.keys(characterList)
                            .sort()
                            .map(item => (
                                <Col md="4" key={item}>
                                    <Card className="m-2 w-100">
                                        <CardHeader>
                                            <CardText className="ml-2">
                                                <Input
                                                    type="checkbox"
                                                    checked={characters.includes(
                                                        item
                                                    )}
                                                    value={item}
                                                    name={'characters'}
                                                    onChange={this.handleChange}
                                                />{' '}
                                                <strong>
                                                    {characterList[item]}
                                                </strong>
                                            </CardText>
                                        </CardHeader>
                                    </Card>
                                </Col>
                            ))}
                    </Row>
                </div>
                <div>
                    <Row>
                        <Input
                            type="checkbox"
                            value="all"
                            name={'customData'}
                            checked={customDataTypes.every(
                                type =>
                                    this.state[type].length ===
                                    (this.props[type]
                                        ? Object.keys(this.props[type]).length
                                        : 0)
                            )}
                            onChange={this.handleChange}
                        />{' '}
                        <h5 className="my-auto">All Custom Data</h5>
                    </Row>
                    <Row>
                        {customDataTypes.sort().map(
                            type =>
                                this.props[type] && (
                                    <Col md="4" key={type} className="my-1">
                                        <Card className="m-2 w-100 h-100">
                                            <CardHeader>
                                                <CardText className="ml-2">
                                                    <Input
                                                        type="checkbox"
                                                        checked={
                                                            this.state[type]
                                                                .length > 0 &&
                                                            Object.keys(
                                                                this.props[type]
                                                            ).every(key =>
                                                                this.state[
                                                                    type
                                                                ].includes(key)
                                                            )
                                                        }
                                                        value={type}
                                                        onChange={
                                                            this.handleChange
                                                        }
                                                    />{' '}
                                                    <strong>{type}</strong>
                                                </CardText>
                                            </CardHeader>
                                            <CardBody
                                                key={type}
                                                className="py-2 ml-4"
                                            >
                                                {Object.keys(this.props[type])
                                                    .sort()
                                                    .map(key => (
                                                        <CardText key={key}>
                                                            <Input
                                                                type="checkbox"
                                                                checked={this.state[
                                                                    type
                                                                ].includes(key)}
                                                                id={key}
                                                                value={type}
                                                                onChange={
                                                                    this
                                                                        .handleChange
                                                                }
                                                            />{' '}
                                                            {this.props[type][
                                                                key
                                                            ].name
                                                                ? this.props[
                                                                      type
                                                                  ][key].name
                                                                : key}
                                                        </CardText>
                                                    ))}
                                            </CardBody>
                                        </Card>
                                    </Col>
                                )
                        )}
                    </Row>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        characterList: state.characterList,
        user: state.user,
        customArchetypes: state.customArchetypes,
        customArchetypeTalents: state.customArchetypeTalents,
        customArmor: state.customArmor,
        customCareers: state.customCareers,
        customGear: state.customGear,
        customMotivations: state.customMotivations,
        customSettings: state.customSettings,
        customSkills: state.customSkills,
        customTalents: state.customTalents,
        customVehicles: state.customVehicles,
        customWeapons: state.customWeapons
    };
};

const matchDispatchToProps = dispatch =>
    bindActionCreators(
        { importCharacter, importCustomData, addDataSet },
        dispatch
    );

export const ImportExport = connect(
    mapStateToProps,
    matchDispatchToProps
)(ImportExportComponent);
