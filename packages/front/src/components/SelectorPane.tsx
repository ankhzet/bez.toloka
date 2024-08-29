import Autosuggest, { AutosuggestProps } from 'react-autosuggest';
import React, { CSSProperties, useCallback, VFC } from 'react';

import { Selector } from './Selectors';
import { SelectorsManager } from './SelectorsManager';
import { useInput } from '../hooks';

export const SelectorPane: VFC<{
    selectors: SelectorsManager<any>;
    selector: Selector<any>;
    onChange: (selector: Selector<any>) => void;
    onRemove: (selector: Selector<any>) => void;
}> = ({ selectors, selector, onRemove }) => {
    const type = useInput<string, 'select'>({
        name: 'type',
        value: selector.type,
        onChange: useCallback(
            (_, value) => {
                selector.type = value;
            },
            [selector],
        ),
    });
    const value = useInput({
        name: 'value',
        value: selector.value,
        onChange: useCallback(
            (_, value) => {
                selector.value = value;
            },
            [selector],
        ),
    });

    const sel = selectors.selectors.get(type.value);

    const getValue = useCallback((suggestion) => sel?.comparable(suggestion) || '', [sel]);
    const handleValue = useCallback((e: { value: string }) => value.set(e.value), [value.set]);
    const fetchSuggestions = useCallback((input) => sel?.suggestions(input, true) || [], [sel]);
    const shouldRenderSuggestions = useCallback(
        (v, reason) =>
            ['input-focused', 'suggestions-revealed', 'suggestions-updated', 'input-changed', 'render'].includes(
                reason,
            ),
        [],
    );

    const handleRemove = useCallback(() => onRemove(selector), [selector, onRemove]);

    return (
        <div style={{ padding: 10, border: '1px solid green', display: 'flex' }}>
            <select {...type.bind}>
                {selectors.selectors.map((selector, i) => (
                    <option key={i} value={selector.type}>
                        {selector.getLabel()}
                    </option>
                ))}
            </select>
            {sel && (
                <>
                    <span>{' → '}</span>
                    <Autosuggestable
                        style={{ flex: 1 }}
                        placeholder={sel.type}
                        value={value.value}
                        fetchSuggestions={fetchSuggestions}
                        onValueChanged={handleValue}
                        renderSuggestion={getValue}
                        getSuggestionValue={getValue}
                        shouldRenderSuggestions={shouldRenderSuggestions}
                    />
                </>
            )}

            <div>
                Remove <a onClick={handleRemove}>X</a>
            </div>
        </div>
    );
};

class Autosuggestable extends React.Component<
    {
        value: string;
        fetchSuggestions: (match: string) => string[];
        placeholder: string;
        onValueChanged: (e: { value: string }) => void;
        renderSuggestion: (v: string) => string;
        getSuggestionValue: (v: string) => string;
        shouldRenderSuggestions: (v: string, reason: string) => boolean;
        style: CSSProperties;
    } & Partial<AutosuggestProps<any, any>>,
    { value: string; suggestions: string[] }
> {
    state = {
        value: this.props.value || '',
        suggestions: this.getSuggestions(this.props.value || ''),
    };

    getSuggestions(value: string): string[] {
        return this.props.fetchSuggestions(value);
    }

    onChange = (event: any, { newValue }: any) => {
        this.setState({
            value: newValue,
        });

        if (this.props.onValueChanged) {
            this.props.onValueChanged({ value: newValue });
        }
    };

    handleFetch = ({ value }: { value: string }) => {
        console.log(value, this.getSuggestions(value));

        this.setState({
            suggestions: this.getSuggestions(value),
        });
    };

    handleClear = () => {
        this.setState({
            suggestions: [],
        });
    };

    render() {
        const { value: _1, fetchSuggestions: _2, onValueChanged: _3, placeholder, ...rest } = this.props;
        const { value, suggestions } = this.state;

        const inputProps = {
            placeholder,
            value,
            onChange: this.onChange,
        };

        return (
            <Autosuggest
                inputProps={inputProps}
                suggestions={suggestions}
                onSuggestionsFetchRequested={this.handleFetch}
                onSuggestionsClearRequested={this.handleClear}
                {...rest}
            />
        );
    }
}
