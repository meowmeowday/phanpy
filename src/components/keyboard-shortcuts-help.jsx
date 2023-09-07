import './keyboard-shortcuts-help.css';

import { useHotkeys } from 'react-hotkeys-hook';
import { useSnapshot } from 'valtio';

import states from '../utils/states';

import Icon from './icon';
import Modal from './modal';

export default function KeyboardShortcutsHelp() {
  const snapStates = useSnapshot(states);

  function onClose() {
    states.showKeyboardShortcutsHelp = false;
  }

  useHotkeys(
    '?, shift+?',
    (e) => {
      console.log('help');
      states.showKeyboardShortcutsHelp = true;
    },
    {
      ignoreEventWhen: (e) => {
        const hasModal = !!document.querySelector('#modal-container > *');
        return hasModal;
      },
    },
  );

  const escRef = useHotkeys('esc', onClose, []);

  return (
    !!snapStates.showKeyboardShortcutsHelp && (
      <Modal
        class="light"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div
          id="keyboard-shortcuts-help-container"
          class="sheet"
          tabindex="-1"
          ref={escRef}
        >
          <button type="button" class="sheet-close" onClick={onClose}>
            <Icon icon="x" />
          </button>
          <header>
            <h2>Keyboard shortcuts</h2>
          </header>
          <main>
            <table>
              {[
                {
                  action: 'Keyboard shortcuts help',
                  keys: <kbd>?</kbd>,
                },
                {
                  action: 'Next post',
                  keys: <kbd>j</kbd>,
                },
                {
                  action: 'Previous post',
                  keys: <kbd>k</kbd>,
                },
                {
                  action: 'Skip carousel to next post',
                  keys: (
                    <>
                      <kbd>Shift</kbd> + <kbd>j</kbd>
                    </>
                  ),
                },
                {
                  action: 'Skip carousel to previous post',
                  keys: (
                    <>
                      <kbd>Shift</kbd> + <kbd>k</kbd>
                    </>
                  ),
                },
                {
                  action: 'Search',
                  keys: <kbd>/</kbd>,
                },
                {
                  action: 'Compose new post',
                  keys: <kbd>c</kbd>,
                },
                {
                  action: 'Send post',
                  keys: (
                    <>
                      <kbd>Ctrl</kbd> + <kbd>Enter</kbd> or <kbd>⌘</kbd> +{' '}
                      <kbd>Enter</kbd>
                    </>
                  ),
                },
                {
                  action: 'Open post details',
                  keys: (
                    <>
                      <kbd>Enter</kbd> or <kbd>o</kbd>
                    </>
                  ),
                },
                {
                  action: 'Toggle expanded/collapsed thread',
                  keys: <kbd>x</kbd>,
                },
                {
                  action: 'Close post or dialogs',
                  keys: (
                    <>
                      <kbd>Esc</kbd> or <kbd>Backspace</kbd>
                    </>
                  ),
                },
              ].map(({ action, keys }) => (
                <tr key={action}>
                  <th>{action}</th>
                  <td>{keys}</td>
                </tr>
              ))}
            </table>
          </main>
        </div>
      </Modal>
    )
  );
}
