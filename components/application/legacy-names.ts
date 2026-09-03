/**
 * 旧名（`Application*` 接頭辞つき）の後方互換エイリアス。
 *
 * 公開 API は接頭辞なしへ統一しました（[decisions/adr-0006](../../decisions/adr-0006-drop-application-prefix.md)）。
 * このファイルは v6.2.0 を非破壊にするためだけに存在し、**v7.0.0 で削除します**。
 *
 * 利用側の移行はエディタの一括置換で足ります。対応表は
 * [design-system/naming-migration.md](../../design-system/naming-migration.md) を参照してください。
 *
 * <important>
 * ここへ新しい名前を追加しないでください。新規 export は index.ts へ接頭辞なしで置きます。
 * </important>
 */

export {
  /** @deprecated v7.0.0 で削除。`ActiveIndicator` を使ってください。 */
  ActiveIndicator as ApplicationActiveIndicator,
} from "./ActiveIndicator";
export type {
  /** @deprecated v7.0.0 で削除。`ActiveIndicatorProps` を使ってください。 */
  ActiveIndicatorProps as ApplicationActiveIndicatorProps,
} from "./ActiveIndicator";

export {
  /** @deprecated v7.0.0 で削除。`Badge` を使ってください。 */
  Badge as ApplicationBadge,
} from "./Badge";
export type {
  /** @deprecated v7.0.0 で削除。`BadgeProps` を使ってください。 */
  BadgeProps as ApplicationBadgeProps,
  /** @deprecated v7.0.0 で削除。`BadgeTone` を使ってください。 */
  BadgeTone as ApplicationBadgeTone,
} from "./Badge";

export {
  /** @deprecated v7.0.0 で削除。`Button` を使ってください。 */
  Button as ApplicationButton,
} from "./Button";
export type {
  /** @deprecated v7.0.0 で削除。`ButtonProps` を使ってください。 */
  ButtonProps as ApplicationButtonProps,
  /** @deprecated v7.0.0 で削除。`ButtonVariant` を使ってください。 */
  ButtonVariant as ApplicationButtonVariant,
} from "./Button";

export {
  /** @deprecated v7.0.0 で削除。`ButtonGroup` を使ってください。 */
  ButtonGroup as ApplicationButtonGroup,
} from "./ButtonGroup";
export type {
  /** @deprecated v7.0.0 で削除。`ButtonGroupItem` を使ってください。 */
  ButtonGroupItem as ApplicationButtonGroupItem,
  /** @deprecated v7.0.0 で削除。`ButtonGroupProps` を使ってください。 */
  ButtonGroupProps as ApplicationButtonGroupProps,
} from "./ButtonGroup";

export {
  /** @deprecated v7.0.0 で削除。`Checkbox` を使ってください。 */
  Checkbox as ApplicationCheckbox,
} from "./Checkbox";
export type {
  /** @deprecated v7.0.0 で削除。`CheckboxProps` を使ってください。 */
  CheckboxProps as ApplicationCheckboxProps,
} from "./Checkbox";

export {
  /** @deprecated v7.0.0 で削除。`COMBOBOX_CREATE_PREFIX` を使ってください。 */
  COMBOBOX_CREATE_PREFIX as APPLICATION_COMBOBOX_CREATE_PREFIX,
  /** @deprecated v7.0.0 で削除。`Combobox` を使ってください。 */
  Combobox as ApplicationCombobox,
} from "./Combobox";
export type {
  /** @deprecated v7.0.0 で削除。`ComboboxItem` を使ってください。 */
  ComboboxItem as ApplicationComboboxItem,
  /** @deprecated v7.0.0 で削除。`ComboboxProps` を使ってください。 */
  ComboboxProps as ApplicationComboboxProps,
} from "./Combobox";

export {
  /** @deprecated v7.0.0 で削除。`ConfirmDialog` を使ってください。 */
  ConfirmDialog as ApplicationConfirmDialog,
} from "./ConfirmDialog";
export type {
  /** @deprecated v7.0.0 で削除。`ConfirmDialogProps` を使ってください。 */
  ConfirmDialogProps as ApplicationConfirmDialogProps,
} from "./ConfirmDialog";

export {
  /** @deprecated v7.0.0 で削除。`CopyButton` を使ってください。 */
  CopyButton as ApplicationCopyButton,
} from "./CopyButton";
export type {
  /** @deprecated v7.0.0 で削除。`CopyButtonProps` を使ってください。 */
  CopyButtonProps as ApplicationCopyButtonProps,
  /** @deprecated v7.0.0 で削除。`CopyResult` を使ってください。 */
  CopyResult as ApplicationCopyResult,
} from "./CopyButton";

export {
  /** @deprecated v7.0.0 で削除。`DatePicker` を使ってください。 */
  DatePicker as ApplicationDatePicker,
} from "./DatePicker";
export type {
  /** @deprecated v7.0.0 で削除。`DatePickerMode` を使ってください。 */
  DatePickerMode as ApplicationDatePickerMode,
  /** @deprecated v7.0.0 で削除。`DatePickerProps` を使ってください。 */
  DatePickerProps as ApplicationDatePickerProps,
  /** @deprecated v7.0.0 で削除。`DatePickerValue` を使ってください。 */
  DatePickerValue as ApplicationDatePickerValue,
} from "./DatePicker";

export {
  /** @deprecated v7.0.0 で削除。`Dialog` を使ってください。 */
  Dialog as ApplicationDialog,
} from "./Dialog";
export type {
  /** @deprecated v7.0.0 で削除。`DialogProps` を使ってください。 */
  DialogProps as ApplicationDialogProps,
} from "./Dialog";

export {
  /** @deprecated v7.0.0 で削除。`Dropdown` を使ってください。 */
  Dropdown as ApplicationDropdown,
} from "./Dropdown";
export type {
  /** @deprecated v7.0.0 で削除。`DropdownItem` を使ってください。 */
  DropdownItem as ApplicationDropdownItem,
  /** @deprecated v7.0.0 で削除。`DropdownProps` を使ってください。 */
  DropdownProps as ApplicationDropdownProps,
} from "./Dropdown";

export {
  /** @deprecated v7.0.0 で削除。`FieldSet` を使ってください。 */
  FieldSet as ApplicationFieldSet,
} from "./FieldSet";
export type {
  /** @deprecated v7.0.0 で削除。`FieldSetProps` を使ってください。 */
  FieldSetProps as ApplicationFieldSetProps,
} from "./FieldSet";

export {
  /** @deprecated v7.0.0 で削除。`FormDialog` を使ってください。 */
  FormDialog as ApplicationFormDialog,
} from "./FormDialog";
export type {
  /** @deprecated v7.0.0 で削除。`FormDialogProps` を使ってください。 */
  FormDialogProps as ApplicationFormDialogProps,
} from "./FormDialog";

export {
  /** @deprecated v7.0.0 で削除。`FormField` を使ってください。 */
  FormField as ApplicationFormField,
} from "./FormField";
export type {
  /** @deprecated v7.0.0 で削除。`FormFieldProps` を使ってください。 */
  FormFieldProps as ApplicationFormFieldProps,
} from "./FormField";

export {
  /** @deprecated v7.0.0 で削除。`Input` を使ってください。 */
  Input as ApplicationInput,
} from "./Input";
export type {
  /** @deprecated v7.0.0 で削除。`InputProps` を使ってください。 */
  InputProps as ApplicationInputProps,
} from "./Input";

export {
  /** @deprecated v7.0.0 で削除。`NavItem` を使ってください。 */
  NavItem as ApplicationNavItem,
} from "./NavItem";
export type {
  /** @deprecated v7.0.0 で削除。`NavItemColor` を使ってください。 */
  NavItemColor as ApplicationNavItemColor,
  /** @deprecated v7.0.0 で削除。`NavItemProps` を使ってください。 */
  NavItemProps as ApplicationNavItemProps,
} from "./NavItem";

export {
  /** @deprecated v7.0.0 で削除。`Pagination` を使ってください。 */
  Pagination as ApplicationPagination,
} from "./Pagination";
export type {
  /** @deprecated v7.0.0 で削除。`PaginationProps` を使ってください。 */
  PaginationProps as ApplicationPaginationProps,
} from "./Pagination";

export {
  /** @deprecated v7.0.0 で削除。`RadioGroup` を使ってください。 */
  RadioGroup as ApplicationRadioGroup,
} from "./RadioGroup";
export type {
  /** @deprecated v7.0.0 で削除。`RadioGroupItem` を使ってください。 */
  RadioGroupItem as ApplicationRadioGroupItem,
  /** @deprecated v7.0.0 で削除。`RadioGroupProps` を使ってください。 */
  RadioGroupProps as ApplicationRadioGroupProps,
  /** @deprecated v7.0.0 で削除。`RadioGroupVariant` を使ってください。 */
  RadioGroupVariant as ApplicationRadioGroupVariant,
} from "./RadioGroup";

export {
  /** @deprecated v7.0.0 で削除。`RadioTable` を使ってください。 */
  RadioTable as ApplicationRadioTable,
} from "./RadioTable";
export type {
  /** @deprecated v7.0.0 で削除。`RadioTableProps` を使ってください。 */
  RadioTableProps as ApplicationRadioTableProps,
} from "./RadioTable";

export {
  /** @deprecated v7.0.0 で削除。`ScopeSearch` を使ってください。 */
  ScopeSearch as ApplicationScopeSearch,
} from "./ScopeSearch";
export type {
  /** @deprecated v7.0.0 で削除。`ScopeSearchItem` を使ってください。 */
  ScopeSearchItem as ApplicationScopeSearchItem,
  /** @deprecated v7.0.0 で削除。`ScopeSearchProps` を使ってください。 */
  ScopeSearchProps as ApplicationScopeSearchProps,
} from "./ScopeSearch";

export {
  /** @deprecated v7.0.0 で削除。`SearchInput` を使ってください。 */
  SearchInput as ApplicationSearchInput,
} from "./SearchInput";
export type {
  /** @deprecated v7.0.0 で削除。`SearchInputProps` を使ってください。 */
  SearchInputProps as ApplicationSearchInputProps,
} from "./SearchInput";

export {
  /** @deprecated v7.0.0 で削除。`Select` を使ってください。 */
  Select as ApplicationSelect,
} from "./Select";
export type {
  /** @deprecated v7.0.0 で削除。`SelectItem` を使ってください。 */
  SelectItem as ApplicationSelectItem,
  /** @deprecated v7.0.0 で削除。`SelectProps` を使ってください。 */
  SelectProps as ApplicationSelectProps,
} from "./Select";

export {
  /** @deprecated v7.0.0 で削除。`Table` を使ってください。 */
  Table as ApplicationTable,
} from "./Table";
export type {
  /** @deprecated v7.0.0 で削除。`TableColumn` を使ってください。 */
  TableColumn as ApplicationTableColumn,
  /** @deprecated v7.0.0 で削除。`TableProps` を使ってください。 */
  TableProps as ApplicationTableProps,
} from "./Table";

export {
  /** @deprecated v7.0.0 で削除。`Tabs` を使ってください。 */
  Tabs as ApplicationTabs,
} from "./Tabs";
export type {
  /** @deprecated v7.0.0 で削除。`TabItem` を使ってください。 */
  TabItem as ApplicationTabItem,
  /** @deprecated v7.0.0 で削除。`TabsProps` を使ってください。 */
  TabsProps as ApplicationTabsProps,
} from "./Tabs";

export {
  /** @deprecated v7.0.0 で削除。`ThemeToggle` を使ってください。 */
  ThemeToggle as ApplicationThemeToggle,
} from "./ThemeToggle";
export type {
  /** @deprecated v7.0.0 で削除。`ThemeToggleProps` を使ってください。 */
  ThemeToggleProps as ApplicationThemeToggleProps,
} from "./ThemeToggle";

export {
  /** @deprecated v7.0.0 で削除。`toast` を使ってください。 */
  toast as ApplicationToast,
  /** @deprecated v7.0.0 で削除。`Toaster` を使ってください。 */
  Toaster as ApplicationToaster,
} from "./Toast";
export type {
  /** @deprecated v7.0.0 で削除。`ToastOptions` を使ってください。 */
  ToastOptions as ApplicationToastOptions,
  /** @deprecated v7.0.0 で削除。`ToastType` を使ってください。 */
  ToastType as ApplicationToastType,
} from "./Toast";

export {
  /** @deprecated v7.0.0 で削除。`TreeSelect` を使ってください。 */
  TreeSelect as ApplicationTreeSelect,
} from "./TreeSelect";
export type {
  /** @deprecated v7.0.0 で削除。`TreeSelectItem` を使ってください。 */
  TreeSelectItem as ApplicationTreeSelectItem,
  /** @deprecated v7.0.0 で削除。`TreeSelectProps` を使ってください。 */
  TreeSelectProps as ApplicationTreeSelectProps,
} from "./TreeSelect";
