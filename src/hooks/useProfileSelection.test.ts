import { renderHook, act } from '@testing-library/react';
import { useProfileSelection } from './useProfileSelection';

describe('useProfileSelection', () => {
  it('initializes with empty selection', () => {
    const { result } = renderHook(() => useProfileSelection());

    expect(result.current.selectedIds).toEqual([]);
    expect(result.current.getSelectionCount()).toBe(0);
    expect(result.current.maxSelection).toBe(4);
  });

  it('initializes with custom max selection', () => {
    const { result } = renderHook(() => useProfileSelection(6));

    expect(result.current.maxSelection).toBe(6);
  });

  it('toggles profile selection', () => {
    const { result } = renderHook(() => useProfileSelection());

    act(() => {
      result.current.toggleSelection('profile1');
    });

    expect(result.current.selectedIds).toContain('profile1');
    expect(result.current.isSelected('profile1')).toBe(true);
    expect(result.current.getSelectionCount()).toBe(1);

    act(() => {
      result.current.toggleSelection('profile1');
    });

    expect(result.current.selectedIds).not.toContain('profile1');
    expect(result.current.isSelected('profile1')).toBe(false);
    expect(result.current.getSelectionCount()).toBe(0);
  });

  it('selects profile directly', () => {
    const { result } = renderHook(() => useProfileSelection());

    act(() => {
      result.current.selectProfile('profile1');
    });

    expect(result.current.selectedIds).toContain('profile1');
    expect(result.current.isSelected('profile1')).toBe(true);
  });

  it('deselects profile directly', () => {
    const { result } = renderHook(() => useProfileSelection());

    act(() => {
      result.current.selectProfile('profile1');
    });

    expect(result.current.isSelected('profile1')).toBe(true);

    act(() => {
      result.current.deselectProfile('profile1');
    });

    expect(result.current.isSelected('profile1')).toBe(false);
  });

  it('respects maximum selection limit', () => {
    const { result } = renderHook(() => useProfileSelection(2));

    act(() => {
      result.current.selectProfile('profile1');
      result.current.selectProfile('profile2');
      result.current.selectProfile('profile3'); // Should be ignored
    });

    expect(result.current.getSelectionCount()).toBe(2); 
    expect(result.current.selectedIds).toContain('profile1');
    expect(result.current.selectedIds).toContain('profile2');
    expect(result.current.selectedIds).not.toContain('profile3');
  });

  it('toggle selection respects maximum limit', () => {
    const { result } = renderHook(() => useProfileSelection(2));

    act(() => {
      result.current.toggleSelection('profile1');
      result.current.toggleSelection('profile2');
      result.current.toggleSelection('profile3'); // Should be ignored
    });

    expect(result.current.getSelectionCount()).toBe(2);
    expect(result.current.selectedIds).not.toContain('profile3');
  });

  it('can select when already selected profile is toggled', () => {
    const { result } = renderHook(() => useProfileSelection(2));

    act(() => {
      result.current.selectProfile('profile1');
      result.current.selectProfile('profile2');
    });

    expect(result.current.isAtLimit()).toBe(true);

    act(() => {
      result.current.toggleSelection('profile1'); // Remove profile1
    });

    expect(result.current.getSelectionCount()).toBe(1);

    act(() => {
      result.current.toggleSelection('profile3'); // Should work now
    });

    expect(result.current.selectedIds).toContain('profile3');
    expect(result.current.getSelectionCount()).toBe(2);
  });

  it('clears all selections', () => {
    const { result } = renderHook(() => useProfileSelection());

    act(() => {
      result.current.selectProfile('profile1');
      result.current.selectProfile('profile2');
      result.current.selectProfile('profile3');
    });

    expect(result.current.getSelectionCount()).toBe(3);

    act(() => {
      result.current.clearSelection();
    });

    expect(result.current.getSelectionCount()).toBe(0);
    expect(result.current.selectedIds).toEqual([]);
  });

  it('selects multiple profiles at once', () => {
    const { result } = renderHook(() => useProfileSelection());

    act(() => {
      result.current.selectMultiple(['profile1', 'profile2', 'profile3']);
    });

    expect(result.current.getSelectionCount()).toBe(3);
    expect(result.current.selectedIds).toContain('profile1');
    expect(result.current.selectedIds).toContain('profile2');
    expect(result.current.selectedIds).toContain('profile3');
  });

  it('selectMultiple respects maximum limit', () => {
    const { result } = renderHook(() => useProfileSelection(2));

    act(() => {
      result.current.selectMultiple(['profile1', 'profile2', 'profile3', 'profile4']);
    });

    expect(result.current.getSelectionCount()).toBe(2);
    expect(result.current.selectedIds).toContain('profile1');
    expect(result.current.selectedIds).toContain('profile2');
    expect(result.current.selectedIds).not.toContain('profile3');
    expect(result.current.selectedIds).not.toContain('profile4');
  });

  it('selectMultiple preserves existing selections', () => {
    const { result } = renderHook(() => useProfileSelection(4));

    act(() => {
      result.current.selectProfile('existing1');
    });

    expect(result.current.getSelectionCount()).toBe(1);

    act(() => {
      result.current.selectMultiple(['profile1', 'profile2']);
    });

    expect(result.current.getSelectionCount()).toBe(3);
    expect(result.current.selectedIds).toContain('existing1');
    expect(result.current.selectedIds).toContain('profile1');
    expect(result.current.selectedIds).toContain('profile2');
  });

  it('correctly reports if can select', () => {
    const { result } = renderHook(() => useProfileSelection(2));

    expect(result.current.canSelect('profile1')).toBe(true);

    act(() => {
      result.current.selectProfile('profile1');
    });

    expect(result.current.canSelect('profile1')).toBe(false); // Already selected
    expect(result.current.canSelect('profile2')).toBe(true);

    act(() => {
      result.current.selectProfile('profile2');
    });

    expect(result.current.canSelect('profile3')).toBe(false); // At limit
  });

  it('correctly reports if at limit', () => {
    const { result } = renderHook(() => useProfileSelection(2));

    expect(result.current.isAtLimit()).toBe(false);

    act(() => {
      result.current.selectProfile('profile1');
    });

    expect(result.current.isAtLimit()).toBe(false);

    act(() => {
      result.current.selectProfile('profile2');
    });

    expect(result.current.isAtLimit()).toBe(true);
  });

  it('correctly calculates remaining slots', () => {
    const { result } = renderHook(() => useProfileSelection(3));

    expect(result.current.getRemainingSlots()).toBe(3);

    act(() => {
      result.current.selectProfile('profile1');
    });

    expect(result.current.getRemainingSlots()).toBe(2);

    act(() => {
      result.current.selectProfile('profile2');
      result.current.selectProfile('profile3');
    });

    expect(result.current.getRemainingSlots()).toBe(0);
  });

  it('getSelectedIds returns array of selected IDs', () => {
    const { result } = renderHook(() => useProfileSelection());

    act(() => {
      result.current.selectProfile('profile2');
      result.current.selectProfile('profile1');
      result.current.selectProfile('profile3');
    });

    const selectedIds = result.current.getSelectedIds();
    expect(selectedIds).toHaveLength(3);
    expect(selectedIds).toContain('profile1');
    expect(selectedIds).toContain('profile2');
    expect(selectedIds).toContain('profile3');
  });

  it('maintains selection order', () => {
    const { result } = renderHook(() => useProfileSelection());

    act(() => {
      result.current.selectProfile('profile3');
      result.current.selectProfile('profile1');
      result.current.selectProfile('profile2');
    });

    // Should maintain insertion order
    expect(result.current.selectedIds).toEqual(['profile3', 'profile1', 'profile2']);
  });

  it('handles duplicate selections gracefully', () => {
    const { result } = renderHook(() => useProfileSelection());

    act(() => {
      result.current.selectProfile('profile1');
      result.current.selectProfile('profile1'); // Duplicate
    });

    expect(result.current.getSelectionCount()).toBe(1);
    expect(result.current.selectedIds).toEqual(['profile1']);
  });

  it('handles deselecting non-existent profile gracefully', () => {
    const { result } = renderHook(() => useProfileSelection());

    act(() => {
      result.current.deselectProfile('non-existent');
    });

    expect(result.current.getSelectionCount()).toBe(0);
    expect(result.current.selectedIds).toEqual([]);
  });
});