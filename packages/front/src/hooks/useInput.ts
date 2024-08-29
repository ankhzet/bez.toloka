import { useState, useCallback, useLayoutEffect, ComponentProps, JSXElementConstructor } from 'react';

type Inputs = 'input' | 'select' | 'textarea';
type BareInputProps<I extends keyof JSX.IntrinsicElements | JSXElementConstructor<Inputs>> = Omit<
    ComponentProps<I>,
    'value' | 'onChange'
>;
export interface UseInputProps<T> {
    name: string;
    value: T;
    onChange?: (name: string, value: T) => void;
    toVal?: (str: string, old: T) => T;
    toStr?: (val: T) => string;
}

interface UseInputReturn<T, I extends Inputs> {
    value: T;
    set: (value: T) => void;
    bind: ComponentProps<I>;
}

export const useInput = <T = string, I extends Inputs = 'input'>({
    name,
    value: initial,
    toStr,
    toVal,
    onChange,
    ...rest
}: UseInputProps<T> & BareInputProps<I>): UseInputReturn<T, I> => {
    const [value, setValue] = useState(initial);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isCheckbox = (rest as any).type === 'checkbox';

    const handleChange = useCallback(
        ({ target: { value: changed, checked } }) => {
            if (isCheckbox) {
                setValue(toVal ? toVal(checked, value) : checked);
            } else {
                setValue(toVal ? toVal(changed, value) : changed);
            }
        },
        [isCheckbox, toVal, value],
    );

    useLayoutEffect(() => {
        onChange && onChange(name, value);
    }, [name, onChange, value]);

    return {
        value,
        set: setValue,
        bind: <ComponentProps<I>>(isCheckbox
            ? {
                  name,
                  checked: value,
                  onChange: handleChange,
                  ...rest,
              }
            : {
                  name,
                  value: toStr ? toStr(value) : value,
                  onChange: handleChange,
                  ...rest,
              }),
    };
};
