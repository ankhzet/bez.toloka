import Nav from 'react-bootstrap/Nav';
import React, { VFC } from 'react';
import { Link } from 'react-router-dom';

export const Menu: VFC<{ links: { to: string; title: string }[] }> = ({ links }) => (
    <Nav variant="pills" defaultActiveKey={links[0]?.to}>
        {links.map((link) => (
            <Nav.Item key={link.to}>
                <Nav.Link as={Link} to={link.to}>
                    {link.title}
                </Nav.Link>
            </Nav.Item>
        ))}
    </Nav>
);
