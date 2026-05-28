import { type ComponentType } from 'react';
import { useStylesTabContext } from './context';
import type { StyleOptionProps, StylesTabState } from './types';
import { StylesTabActions } from './actions';

export function connectStylesOption<P extends StyleOptionProps>(
  Component: ComponentType<P>,
  mapExtraState?: (state: StylesTabState, own: P) => Partial<P>,
) {
  return function ConnectedOption(ownProps: P) {
    const ctx = useStylesTabContext();

    const { state, dispatch } = ctx;
    const value = state.settings[ownProps.group.name]?.[ownProps.property as string];

    const props = {
      ...ownProps,
      value,
      ...(mapExtraState ? mapExtraState(state, ownProps) : {}),
      onChange: (next: unknown) => {
        dispatch({
          type: StylesTabActions.updateSingleValue,
          group: ownProps.group,
          propertyName: ownProps.property as string,
          value: next,
        });
      },
    } as P;

    return <Component {...props} />;
  };
}
