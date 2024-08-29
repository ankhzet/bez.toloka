import React, { useCallback, useState, VFC } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import { ExtensionConfig } from '@beztoloka/domains';
import { useInput } from '../hooks';
import Container from 'react-bootstrap/Container';

export const NotificationsPane: VFC<{ config: ExtensionConfig }> = ({ config }) => {
    const sound = useInput({
        name: 'sound',
        value: config.buzzerSound,
        onChange: useCallback(
            (_, value) => {
                config.buzzerSound = value;
            },
            [config],
        ),
    });
    const volume = useInput({
        name: 'volume',
        value: config.buzzerVolume,
        onChange: useCallback(
            (_, value) => {
                config.buzzerVolume = value;
            },
            [config],
        ),
    });

    return (
        <Card>
            <Container>
                <Row>
                    <label>
                        <Row>
                            <Col>
                                <span>Sound:</span>
                            </Col>
                            <Col>
                                <input {...sound.bind} />
                            </Col>
                        </Row>
                    </label>
                </Row>
                <Row>
                    <label>
                        <Row>
                            <Col>
                                <span>Volume:</span>
                                <output>{~~(volume.value * 100)}</output>
                            </Col>
                            <Col>
                                <input type="range" min={0} max={1} step={0.01} {...volume.bind} />
                            </Col>
                        </Row>
                    </label>
                </Row>
            </Container>
        </Card>
    );
};
// React.createClass({
//     getInitialState() {
//         return {
//             sound: this.props.config.buzzerSound,
//             volume: this.props.config.buzzerVolume,
//         };
//     },
//     changeSound(e) {
//         this.setState({
//             sound: (this.props.config.buzzerSound = e.target.value),
//         });
//     },
//     changeVolume(e) {
//         this.setState({
//             volume: (this.props.config.buzzerVolume = e.target.value),
//         });
//     },
//     render() {
//         return React.createElement(
//             'div',
//             { className: 'notifications-pane' },
//             React.createElement(
//                 'div',
//                 null,
//                 React.createElement(
//                     'label',
//                     null,
//                     'Sound:',
//                     React.createElement('input', { value: this.state.sound, onChange: this.changeSound })
//                 )
//             ),
//             React.createElement(
//                 'div',
//                 null,
//                 React.createElement(
//                     'label',
//                     null,
//                     'Volume: ',
//                     React.createElement('output', null, ~~(this.state.volume * 100)),
//                     React.createElement('input', {
//                         type: 'range',
//                         id: 'volume',
//                         min: '0',
//                         max: '1',
//                         step: '0.01',
//                         value: this.state.volume,
//                         onChange: this.changeVolume,
//                     })
//                 )
//             )
//         );
//     },
// });
