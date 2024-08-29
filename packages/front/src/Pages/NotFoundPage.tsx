import React, { VFC } from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: VFC = () => (
    <div>
        Страница не найдена. Вернуться на <Link to="/">главную</Link>?
    </div>
);
