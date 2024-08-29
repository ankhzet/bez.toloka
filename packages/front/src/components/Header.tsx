import React, { VFC } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';

import { Menu } from './Menu';

export const Header: VFC<{ title: string; links: { to: string; title: string }[] }> = ({ title, links }) => (
    <Navbar bg="dark" variant="dark">
        <Container>
            <Navbar.Brand href="#home">{title}</Navbar.Brand>
            <Menu links={links} />
        </Container>
    </Navbar>
);
