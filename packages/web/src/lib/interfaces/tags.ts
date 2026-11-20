export interface TagListProps {
  tags: string[];
  label: string;
  className?: string;
}

export interface TagInputProps {
  id: string;
  value: string[];
  onChange: (tags: string[]) => void;
  onBlur: () => void;
  suggestions: string[];
  placeholder?: string;
  invalid?: boolean;
  autoFocus?: boolean;
}
