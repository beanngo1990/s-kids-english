import React from 'react';
import { Modal, Platform } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';

jest.mock('@react-native-community/datetimepicker', () => {
  const ReactModule = jest.requireActual<typeof React>('react');
  const ReactNative =
    jest.requireActual<typeof import('react-native')>('react-native');

  return {
    __esModule: true,
    default: (props: Record<string, unknown>) =>
      ReactModule.createElement(ReactNative.View, props),
  };
});

jest.mock('../src/i18n', () => {
  const actual = jest.requireActual('../src/i18n');
  return {
    ...actual,
    useI18n: () => actual.createTranslator('vi'),
  };
});

import { ReminderTimePickerModal } from '../src/components/ReminderTimePickerModal';

const originalPlatformOS = Platform.OS;

beforeEach(() => {
  Platform.OS = 'ios';
});

afterAll(() => {
  Platform.OS = originalPlatformOS;
});

function renderPicker(
  overrides: Partial<React.ComponentProps<typeof ReminderTimePickerModal>> = {},
) {
  const props: React.ComponentProps<typeof ReminderTimePickerModal> = {
    isSaving: false,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    value: '19:30',
    visible: true,
    ...overrides,
  };
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  act(() => {
    renderer = ReactTestRenderer.create(<ReminderTimePickerModal {...props} />);
  });

  return { props, renderer: renderer! };
}

test('keeps picker changes as a draft until the parent confirms', () => {
  const onConfirm = jest.fn();
  const { renderer } = renderPicker({ onConfirm });
  const picker = renderer.root.findByProps({
    testID: 'reminder-time-picker',
  });
  const selectedDate = new Date(2026, 7, 27, 22, 35);

  act(() => {
    picker.props.onChange(
      { nativeEvent: { timestamp: selectedDate.valueOf() }, type: 'set' },
      selectedDate,
    );
  });

  expect(onConfirm).not.toHaveBeenCalled();

  const confirmAction = renderer.root.findByProps({
    accessibilityLabel: 'Xác nhận',
  });
  act(() => confirmAction.props.onPress());

  expect(onConfirm).toHaveBeenCalledWith('22:35');

  act(() => renderer.unmount());
});

test('cancel discards the draft and reopening starts from the saved time', () => {
  const onClose = jest.fn();
  const onConfirm = jest.fn();
  const { props, renderer } = renderPicker({ onClose, onConfirm });
  const picker = renderer.root.findByProps({
    testID: 'reminder-time-picker',
  });

  act(() => {
    picker.props.onChange(
      { nativeEvent: { timestamp: 0 }, type: 'set' },
      new Date(2026, 7, 27, 8, 15),
    );
  });
  act(() => {
    renderer.root.findByProps({ accessibilityLabel: 'Hủy' }).props.onPress();
  });

  expect(onClose).toHaveBeenCalledTimes(1);
  expect(onConfirm).not.toHaveBeenCalled();

  act(() => {
    renderer.update(<ReminderTimePickerModal {...props} visible={false} />);
  });
  act(() => {
    renderer.update(<ReminderTimePickerModal {...props} visible />);
  });
  act(() => {
    renderer.root
      .findByProps({ accessibilityLabel: 'Xác nhận' })
      .props.onPress();
  });

  expect(onConfirm).toHaveBeenCalledWith('19:30');

  act(() => renderer.unmount());
});

test('prevents dismiss and confirm actions while the reminder is saving', () => {
  const onClose = jest.fn();
  const onConfirm = jest.fn();
  const { renderer } = renderPicker({
    isSaving: true,
    onClose,
    onConfirm,
  });
  const actions = ['Hủy', 'Xác nhận'].map(accessibilityLabel =>
    renderer.root.findByProps({ accessibilityLabel }),
  );

  actions.forEach(action => {
    expect(action.props.disabled).toBe(true);
    expect(action.props.accessibilityState).toEqual({ disabled: true });
  });
  expect(onClose).not.toHaveBeenCalled();
  expect(onConfirm).not.toHaveBeenCalled();

  act(() => renderer.unmount());
});

test('uses only the native Android clock dialog and commits on its confirm event', () => {
  Platform.OS = 'android';
  const onClose = jest.fn();
  const onConfirm = jest.fn();
  const { renderer } = renderPicker({ onClose, onConfirm, value: '20:30' });

  expect(renderer.root.findAllByType(Modal)).toHaveLength(0);
  const picker = renderer.root.findByProps({
    testID: 'reminder-time-picker',
  });
  expect(picker.props.display).toBe('clock');
  expect(picker.props.is24Hour).toBe(true);
  expect(picker.props.negativeButton).toEqual({ label: 'Hủy' });
  expect(picker.props.positiveButton).toEqual({ label: 'Xác nhận' });

  act(() => {
    picker.props.onChange(
      { nativeEvent: { timestamp: 0 }, type: 'set' },
      new Date(2026, 7, 27, 21, 45),
    );
  });

  expect(onClose).toHaveBeenCalledTimes(1);
  expect(onConfirm).toHaveBeenCalledWith('21:45');

  act(() => renderer.unmount());
});

test('discards an Android native dialog dismissal', () => {
  Platform.OS = 'android';
  const onClose = jest.fn();
  const onConfirm = jest.fn();
  const { renderer } = renderPicker({ onClose, onConfirm });
  const picker = renderer.root.findByProps({
    testID: 'reminder-time-picker',
  });

  act(() => {
    picker.props.onChange(
      { nativeEvent: { timestamp: 0 }, type: 'dismissed' },
      undefined,
    );
  });

  expect(onClose).toHaveBeenCalledTimes(1);
  expect(onConfirm).not.toHaveBeenCalled();

  act(() => renderer.unmount());
});
