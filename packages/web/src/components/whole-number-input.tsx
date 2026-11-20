import { Input } from "@/components/ui/input";
import type { WholeNumberInputProps } from "@/lib/interfaces/inventory";

export function WholeNumberInput({
  id,
  value,
  onChange,
  onBlur,
  min = 0,
  invalid,
  autoFocus,
  onKeyDown,
}: WholeNumberInputProps) {
  return (
    <Input
      id={id}
      type="number"
      inputMode="numeric"
      step={1}
      min={min}
      value={Number.isNaN(value) ? "" : value}
      onChange={(event) => onChange(event.target.valueAsNumber)}
      onFocus={(event) => event.currentTarget.select()}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      aria-invalid={invalid}
      autoFocus={autoFocus}
    />
  );
}
