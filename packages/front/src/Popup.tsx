import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import React, { FC, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { Header } from './components';
import { Routing } from './Routing';
import { Col, Row } from 'react-bootstrap';

export const Popup: FC = () => {
    const { headerLinks, footerLinks } = useMemo(
        () => ({
            headerLinks: [
                { title: 'Tasks', to: '/tasks' },
                { title: 'Settings', to: '/settings' },
            ],
            footerLinks: [{ title: 'Statistics', to: '/statistics' }],
        }),
        [],
    );

    return (
        <Container fluid>
            <Header title="Bez.Toloka" links={headerLinks} />
            <Container fluid>
                <main>
                    <Row>&nbsp;</Row>
                    <Row>
                        <Routing />
                    </Row>
                    <Row>&nbsp;</Row>
                </main>
            </Container>
            <div className="className">
                <footer className="wrapper">
                    <Navbar bg="dark" variant="dark">
                        <Container>
                            {footerLinks.map((link) => (
                                <Nav.Item key={link.to}>
                                    <Nav.Link as={Link} to={link.to}>
                                        {link.title}
                                    </Nav.Link>
                                </Nav.Item>
                            ))}
                            <Navbar.Collapse className="justify-content-end">
                                <Navbar.Text>Bez.Toloka © 2016</Navbar.Text>
                            </Navbar.Collapse>
                        </Container>
                    </Navbar>
                </footer>
            </div>
        </Container>
    );
};
