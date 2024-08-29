import React, { useCallback, useMemo, useState, VFC } from 'react';

import { ExtensionConfig } from '@beztoloka/domains';
import { SelectorsManager } from './SelectorsManager';
import { RequesterSelector, TitleSelector } from './Suggestable';
import { Selectors } from './Selectors';
import { FilterPane } from './FilterPane';

const selectorsManagerFactory = () =>
    new SelectorsManager(
        new Selectors([
            new TitleSelector('title', () => {
                return [
                    { tec: { title: 'Добавление данных об организациях (с рубриками)' } },
                    { tec: { title: 'Оценка похожести музыкальных треков' } },
                    { tec: { title: 'Соответствие товарной категории запросу' } },
                    { tec: { title: 'Название ссылки' } },
                    { tec: { title: 'Актуализация официальных сайтов организаций' } },
                    { tec: { title: 'Справочник кластеризатор' } },
                    { tec: { title: 'фактчекинговые запросы. верификация' } },
                    { tec: { title: 'Обновление данных об организациях (Украина)' } },
                    { tec: { title: 'Фактчекинговые запросы' } },
                    { tec: { title: 'Справочник кластеризатор с картой' } },
                    { tec: { title: 'Определение скриншотов документов с контентом для взрослых' } },
                ];
            }),
            new RequesterSelector('requester', () => {
                return [
                    { tec: { requesterInfo: { name: { RU: 'Я.Единорог' } } } },
                    { tec: { requesterInfo: { name: { RU: 'Я.Водолей' } } } },
                    { tec: { requesterInfo: { name: { RU: 'Я.Орион' } } } },
                    { tec: { requesterInfo: { name: { RU: 'Я.Живописец' } } } },
                    { tec: { requesterInfo: { name: { RU: 'Я.Кассиопея' } } } },
                    { tec: { requesterInfo: { name: { RU: 'Я.Щит' } } } },
                ];
            }),
        ]),
    );

export const FiltersPane: VFC<{ config: ExtensionConfig }> = ({ config }) => {
    const manager = useMemo(selectorsManagerFactory, []);
    const actions = useMemo(
        () => [
            { title: 'Notify', id: 1 },
            { title: 'Ignore', id: 2 },
        ],
        [],
    );
    const [filters, setFilters] = useState(() => [manager.addAction()]);

    const handleAddFilter = useCallback(() => setFilters((prev) => [...prev, manager.addAction()]), []);

    return (
        <div className="filters-pane">
            <div>
                {filters.map((action, filterIdx) => (
                    <div
                        key={filterIdx}
                        className="action-pane"
                        style={{ padding: 10, border: '1px solid teal', display: 'flex', flexDirection: 'column' }}
                    >
                        <FilterPane selectors={manager} filter={action.filter} />
                        <div className="action">
                            Action:
                            {actions.map((option, i) => (
                                <label key={option.id}>
                                    <div>
                                        <input
                                            type="radio"
                                            name={`action${filterIdx}`}
                                            value={option.id}
                                            {...((action as any).action !== undefined
                                                ? { checked: (action as any).action === option.id }
                                                : { defaultChecked: !i })}
                                        />

                                        {option.title}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="adder">
                Add action <a onClick={handleAddFilter}>[+]</a>
            </div>
        </div>
    );
};
