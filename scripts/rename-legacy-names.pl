#!/usr/bin/env perl
#
# application-ui-kit v6.2.0: 旧名（Application* 接頭辞つき）を新名へ置換する。
#
#   find src -type f \( -name '*.ts' -o -name '*.tsx' \) -print0 \
#     | xargs -0 perl scripts/rename-legacy-names.pl
#
# 明示マップのみを語境界付きで置換するので、「Application側」「Application固有」
# のような散文や、package 名 application-ui-kit には当たらない。
# window.ApplicationToast はグローバルの実行時契約なので保護する。
#
# 対応表: design-system/naming-migration.md
use strict;
use warnings;

my %map = (
    ApplicationToast                   => 'toast',
    APPLICATION_COMBOBOX_CREATE_PREFIX => 'COMBOBOX_CREATE_PREFIX',
);

# 残りは接頭辞を除去するだけ
for my $old (
    qw(
    ApplicationActiveIndicator ApplicationActiveIndicatorProps
    ApplicationBadge ApplicationBadgeProps ApplicationBadgeTone
    ApplicationButton ApplicationButtonProps ApplicationButtonVariant
    ApplicationButtonGroup ApplicationButtonGroupItem ApplicationButtonGroupProps
    ApplicationCheckbox ApplicationCheckboxProps
    ApplicationCombobox ApplicationComboboxItem ApplicationComboboxProps
    ApplicationConfirmDialog ApplicationConfirmDialogProps
    ApplicationCopyButton ApplicationCopyButtonProps ApplicationCopyResult
    ApplicationDatePicker ApplicationDatePickerMode ApplicationDatePickerProps
    ApplicationDatePickerValue
    ApplicationDialog ApplicationDialogProps
    ApplicationDropdown ApplicationDropdownItem ApplicationDropdownProps
    ApplicationFieldSet ApplicationFieldSetProps
    ApplicationFormDialog ApplicationFormDialogProps
    ApplicationFormField ApplicationFormFieldProps
    ApplicationInput ApplicationInputProps
    ApplicationNavItem ApplicationNavItemColor ApplicationNavItemProps
    ApplicationPagination ApplicationPaginationProps
    ApplicationRadioGroup ApplicationRadioGroupItem ApplicationRadioGroupProps
    ApplicationRadioGroupVariant
    ApplicationRadioTable ApplicationRadioTableProps
    ApplicationScopeSearch ApplicationScopeSearchItem ApplicationScopeSearchProps
    ApplicationSearchInput ApplicationSearchInputProps
    ApplicationSelect ApplicationSelectItem ApplicationSelectProps
    ApplicationTabItem ApplicationTabs ApplicationTabsProps
    ApplicationTable ApplicationTableColumn ApplicationTableProps
    ApplicationThemeToggle ApplicationThemeToggleProps
    ApplicationToaster ApplicationToastOptions ApplicationToastType
    ApplicationTreeSelect ApplicationTreeSelectItem ApplicationTreeSelectProps
    )
  )
{
    ( my $new = $old ) =~ s/^Application//;
    $map{$old} = $new;
}

# 長い名前から当てる。語境界も付けるので二重の保険。
my @keys = sort { length($b) <=> length($a) } keys %map;

my ( $files, $hits ) = ( 0, 0 );
for my $file (@ARGV) {
    open my $in, '<:encoding(UTF-8)', $file or do { warn "skip $file: $!\n"; next };
    my $text = do { local $/; <$in> };
    close $in;
    my $orig = $text;

    # window.ApplicationToast はグローバルの契約なので退避する
    my $n = 0;
    $text =~ s{window\.ApplicationToast}{"\0KEEP" . $n++ . "\0"}ge;

    my $count = 0;
    for my $old (@keys) {
        $count += ( $text =~ s/\b\Q$old\E\b/$map{$old}/g );
    }

    $text =~ s{\0KEEP\d+\0}{window.ApplicationToast}g;
    next if $text eq $orig;

    open my $out, '>:encoding(UTF-8)', $file or die "write $file: $!";
    print {$out} $text;
    close $out;
    $files++;
    $hits += $count;
    printf "  %-64s %d\n", $file, $count;
}
printf "\n%d files, %d replacements\n", $files, $hits;
