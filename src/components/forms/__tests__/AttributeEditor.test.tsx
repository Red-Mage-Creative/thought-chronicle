import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AttributeEditor } from '../AttributeEditor';
import { EntityAttribute, DefaultEntityAttribute } from '@/types/entities';

describe('AttributeEditor', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('rendering', () => {
    it('should render with empty attributes array', () => {
      const { getByLabelText, getByPlaceholderText } = render(
        <AttributeEditor attributes={[]} onChange={mockOnChange} />
      );
      
      expect(getByLabelText('Attributes')).toBeInTheDocument();
      expect(getByPlaceholderText('e.g., Height')).toBeInTheDocument();
      expect(getByPlaceholderText('e.g., 6\'0')).toBeInTheDocument();
    });

    it('should render existing attributes with key-value pairs', () => {
      const attributes: EntityAttribute[] = [
        { key: 'Class', value: 'Wizard' },
        { key: 'Level', value: '5' }
      ];

      const { getByDisplayValue } = render(
        <AttributeEditor attributes={attributes} onChange={mockOnChange} />
      );

      expect(getByDisplayValue('Class')).toBeInTheDocument();
      expect(getByDisplayValue('Wizard')).toBeInTheDocument();
      expect(getByDisplayValue('Level')).toBeInTheDocument();
      expect(getByDisplayValue('5')).toBeInTheDocument();
    });

    it('should show required indicator for required attributes', () => {
      const attributes: EntityAttribute[] = [
        { key: 'Class', value: 'Wizard' }
      ];
      const defaultAttributes: DefaultEntityAttribute[] = [
        { key: 'Class', required: true, entityTypes: ['pc'] }
      ];

      const { getByText } = render(
        <AttributeEditor 
          attributes={attributes} 
          onChange={mockOnChange}
          defaultAttributes={defaultAttributes}
        />
      );

      expect(getByText('Required')).toBeInTheDocument();
    });

    it('should show hint text for required attributes', () => {
      const defaultAttributes: DefaultEntityAttribute[] = [
        { key: 'Class', required: true, entityTypes: ['pc'] },
        { key: 'Level', required: true, entityTypes: ['pc'] }
      ];

      const { getByText } = render(
        <AttributeEditor 
          attributes={[]} 
          onChange={mockOnChange}
          defaultAttributes={defaultAttributes}
        />
      );

      expect(getByText(/Required attributes: Class, Level/)).toBeInTheDocument();
    });

    it('should show message when no required attributes exist', () => {
      const defaultAttributes: DefaultEntityAttribute[] = [
        { key: 'Background', required: false, entityTypes: ['pc'] }
      ];

      const { getByText } = render(
        <AttributeEditor 
          attributes={[]} 
          onChange={mockOnChange}
          defaultAttributes={defaultAttributes}
        />
      );

      expect(getByText(/No required attributes for this entity type/)).toBeInTheDocument();
    });

    it('should render add attribute button', () => {
      const { getAllByRole } = render(
        <AttributeEditor attributes={[]} onChange={mockOnChange} />
      );
      
      const addButtons = getAllByRole('button');
      expect(addButtons.length).toBeGreaterThan(0);
    });
  });

  describe('user interactions - adding attributes', () => {
    it('should allow adding new attribute', async () => {
      const user = userEvent.setup();
      const { getByPlaceholderText, getAllByRole } = render(
        <AttributeEditor attributes={[]} onChange={mockOnChange} />
      );

      const keyInput = getByPlaceholderText('e.g., Height');
      const valueInput = getByPlaceholderText('e.g., 6\'0');
      
      await user.type(keyInput, 'Strength');
      await user.type(valueInput, '18');

      const addButton = getAllByRole('button').find(btn => 
        btn.querySelector('svg')?.classList.toString().includes('lucide')
      );
      
      await user.click(addButton!);

      expect(mockOnChange).toHaveBeenCalledWith([
        { key: 'Strength', value: '18' }
      ]);
    });

    it('should call onChange when new attribute is added', async () => {
      const user = userEvent.setup();
      const { getByPlaceholderText, getAllByRole } = render(
        <AttributeEditor attributes={[]} onChange={mockOnChange} />
      );

      const keyInput = getByPlaceholderText('e.g., Height');
      await user.type(keyInput, 'Class');

      const addButton = getAllByRole('button').find(btn => 
        btn.querySelector('svg')?.classList.toString().includes('lucide')
      );
      await user.click(addButton!);

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should clear input fields after adding attribute', async () => {
      const user = userEvent.setup();
      const { getByPlaceholderText, getAllByRole } = render(
        <AttributeEditor attributes={[]} onChange={mockOnChange} />
      );

      const keyInput = getByPlaceholderText('e.g., Height') as HTMLInputElement;
      const valueInput = getByPlaceholderText('e.g., 6\'0') as HTMLInputElement;
      
      await user.type(keyInput, 'Class');
      await user.type(valueInput, 'Wizard');

      const addButton = getAllByRole('button').find(btn => 
        btn.querySelector('svg')?.classList.toString().includes('lucide')
      );
      await user.click(addButton!);

      expect(keyInput.value).toBe('');
      expect(valueInput.value).toBe('');
    });

    it('should not add attribute with empty key', async () => {
      const user = userEvent.setup();
      const { getByPlaceholderText, getAllByRole } = render(
        <AttributeEditor attributes={[]} onChange={mockOnChange} />
      );

      const valueInput = getByPlaceholderText('e.g., 6\'0');
      await user.type(valueInput, 'Some Value');

      const addButton = getAllByRole('button').find(btn => 
        btn.querySelector('svg')?.classList.toString().includes('lucide')
      );
      await user.click(addButton!);

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('should trim whitespace from key and value', async () => {
      const user = userEvent.setup();
      const { getByPlaceholderText, getAllByRole } = render(
        <AttributeEditor attributes={[]} onChange={mockOnChange} />
      );

      const keyInput = getByPlaceholderText('e.g., Height');
      const valueInput = getByPlaceholderText('e.g., 6\'0');
      
      await user.type(keyInput, '  Class  ');
      await user.type(valueInput, '  Wizard  ');

      const addButton = getAllByRole('button').find(btn => 
        btn.querySelector('svg')?.classList.toString().includes('lucide')
      );
      await user.click(addButton!);

      expect(mockOnChange).toHaveBeenCalledWith([
        { key: 'Class', value: 'Wizard' }
      ]);
    });

    it('should add attribute when Enter key is pressed in key input', async () => {
      const user = userEvent.setup();
      const { getByPlaceholderText } = render(
        <AttributeEditor attributes={[]} onChange={mockOnChange} />
      );

      const keyInput = getByPlaceholderText('e.g., Height');
      await user.type(keyInput, 'Class{Enter}');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should add attribute when Enter key is pressed in value input', async () => {
      const user = userEvent.setup();
      const { getByPlaceholderText } = render(
        <AttributeEditor attributes={[]} onChange={mockOnChange} />
      );

      const keyInput = getByPlaceholderText('e.g., Height');
      const valueInput = getByPlaceholderText('e.g., 6\'0');
      
      await user.type(keyInput, 'Class');
      await user.type(valueInput, 'Wizard{Enter}');

      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('user interactions - removing attributes', () => {
    it('should allow removing attribute', async () => {
      const user = userEvent.setup();
      const attributes: EntityAttribute[] = [
        { key: 'Class', value: 'Wizard' },
        { key: 'Level', value: '5' }
      ];

      const { getAllByRole } = render(
        <AttributeEditor attributes={attributes} onChange={mockOnChange} />
      );

      const removeButtons = getAllByRole('button').filter(btn => 
        btn.querySelector('svg')?.classList.toString().includes('lucide')
      );
      
      await user.click(removeButtons[0]);

      expect(mockOnChange).toHaveBeenCalledWith([
        { key: 'Level', value: '5' }
      ]);
    });

    it('should call onChange when attribute is removed', async () => {
      const user = userEvent.setup();
      const attributes: EntityAttribute[] = [
        { key: 'Class', value: 'Wizard' }
      ];

      const { getAllByRole } = render(
        <AttributeEditor attributes={attributes} onChange={mockOnChange} />
      );

      const removeButton = getAllByRole('button').find(btn => 
        btn.querySelector('svg')?.classList.toString().includes('lucide')
      );
      
      await user.click(removeButton!);

      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('user interactions - editing attributes', () => {
    it('should allow editing attribute key', async () => {
      const user = userEvent.setup();
      const attributes: EntityAttribute[] = [
        { key: 'Class', value: 'Wizard' }
      ];

      const { getByDisplayValue } = render(
        <AttributeEditor attributes={attributes} onChange={mockOnChange} />
      );

      const keyInput = getByDisplayValue('Class');
      await user.clear(keyInput);
      await user.type(keyInput, 'Race');

      expect(mockOnChange).toHaveBeenCalledWith([
        { key: 'Race', value: 'Wizard' }
      ]);
    });

    it('should allow editing attribute value', async () => {
      const user = userEvent.setup();
      const attributes: EntityAttribute[] = [
        { key: 'Class', value: 'Wizard' }
      ];

      const { getByDisplayValue } = render(
        <AttributeEditor attributes={attributes} onChange={mockOnChange} />
      );

      const valueInput = getByDisplayValue('Wizard');
      await user.clear(valueInput);
      await user.type(valueInput, 'Sorcerer');

      expect(mockOnChange).toHaveBeenCalledWith([
        { key: 'Class', value: 'Sorcerer' }
      ]);
    });

    it('should call onChange with updated attributes', async () => {
      const user = userEvent.setup();
      const attributes: EntityAttribute[] = [
        { key: 'Level', value: '5' }
      ];

      const { getByDisplayValue } = render(
        <AttributeEditor attributes={attributes} onChange={mockOnChange} />
      );

      const valueInput = getByDisplayValue('5');
      await user.clear(valueInput);
      await user.type(valueInput, '10');

      expect(mockOnChange).toHaveBeenCalledWith([
        { key: 'Level', value: '10' }
      ]);
    });
  });

  describe('disabled state', () => {
    it('should handle disabled state for all inputs', () => {
      const attributes: EntityAttribute[] = [
        { key: 'Class', value: 'Wizard' }
      ];

      const { getByDisplayValue, getByPlaceholderText } = render(
        <AttributeEditor 
          attributes={attributes} 
          onChange={mockOnChange}
          disabled={true}
        />
      );

      const keyInput = getByDisplayValue('Class') as HTMLInputElement;
      const valueInput = getByDisplayValue('Wizard') as HTMLInputElement;
      const newKeyInput = getByPlaceholderText('e.g., Height') as HTMLInputElement;
      const newValueInput = getByPlaceholderText('e.g., 6\'0') as HTMLInputElement;

      expect(keyInput.disabled).toBe(true);
      expect(valueInput.disabled).toBe(true);
      expect(newKeyInput.disabled).toBe(true);
      expect(newValueInput.disabled).toBe(true);
    });

    it('should disable all buttons when disabled', () => {
      const attributes: EntityAttribute[] = [
        { key: 'Class', value: 'Wizard' }
      ];

      const { getAllByRole } = render(
        <AttributeEditor 
          attributes={attributes} 
          onChange={mockOnChange}
          disabled={true}
        />
      );

      const buttons = getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });
  });
});
