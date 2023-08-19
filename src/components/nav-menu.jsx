import './nav-menu.css';

import { ControlledMenu, MenuDivider, MenuItem } from '@szhsin/react-menu';
import { useEffect, useRef, useState } from 'preact/hooks';
import { useLongPress } from 'use-long-press';
import { useSnapshot } from 'valtio';

import { api } from '../utils/api';
import safeBoundingBoxPadding from '../utils/safe-bounding-box-padding';
import states from '../utils/states';
import store from '../utils/store';

import Avatar from './avatar';
import Icon from './icon';
import MenuLink from './menu-link';

function NavMenu(props) {
  const snapStates = useSnapshot(states);
  const { instance, authenticated } = api();

  const [currentAccount, setCurrentAccount] = useState();
  const [moreThanOneAccount, setMoreThanOneAccount] = useState(false);

  useEffect(() => {
    const accounts = store.local.getJSON('accounts') || [];
    const acc = accounts.find(
      (account) => account.info.id === store.session.get('currentAccount'),
    );
    if (acc) setCurrentAccount(acc);
    setMoreThanOneAccount(accounts.length > 1);
  }, []);

  // Home = Following
  // But when in multi-column mode, Home becomes columns of anything
  // User may choose pin or not to pin Following
  // If user doesn't pin Following, we show it in the menu
  const showFollowing =
    (snapStates.settings.shortcutsColumnsMode ||
      snapStates.settings.shortcutsViewMode === 'multi-column') &&
    !snapStates.shortcuts.find((pin) => pin.type === 'following');

  const bindLongPress = useLongPress(
    () => {
      states.showAccounts = true;
    },
    {
      threshold: 600,
      detect: 'touch',
      cancelOnMovement: true,
    },
  );

  const buttonRef = useRef();
  const [menuState, setMenuState] = useState(undefined);

  const boundingBoxPadding = safeBoundingBoxPadding([
    0,
    0,
    snapStates.settings.shortcutsViewMode === 'tab-menu-bar' ? 50 : 0,
    0,
  ]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        class={`button plain nav-menu-button ${
          moreThanOneAccount ? 'with-avatar' : ''
        } ${open ? 'active' : ''}`}
        style={{ position: 'relative' }}
        onClick={() => {
          setMenuState((state) => (!state ? 'open' : undefined));
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          states.showAccounts = true;
        }}
        {...bindLongPress()}
      >
        {moreThanOneAccount && (
          <Avatar
            url={
              currentAccount?.info?.avatar || currentAccount?.info?.avatarStatic
            }
            size="l"
            squircle={currentAccount?.info?.bot}
          />
        )}
        <Icon icon="menu" size={moreThanOneAccount ? 's' : 'l'} />
      </button>
      <ControlledMenu
        menuClassName="nav-menu"
        state={menuState}
        anchorRef={buttonRef}
        onClose={() => {
          setMenuState(undefined);
        }}
        containerProps={{
          style: {
            zIndex: 10,
          },
          onClick: () => {
            setMenuState(undefined);
          },
        }}
        portal={{
          target: document.body,
        }}
        {...props}
        overflow="auto"
        viewScroll="close"
        position="anchor"
        align="center"
        boundingBoxPadding={boundingBoxPadding}
        unmountOnClose
      >
        <section>
          {!!snapStates.appVersion?.commitHash &&
            __COMMIT_HASH__ !== snapStates.appVersion.commitHash && (
              <>
                <MenuItem
                  onClick={() => {
                    const yes = confirm('Reload page now to update?');
                    if (yes) {
                      (async () => {
                        try {
                          location.reload();
                        } catch (e) {}
                      })();
                    }
                  }}
                >
                  <Icon icon="sparkles" size="l" />{' '}
                  <span>New update available…</span>
                </MenuItem>
                <MenuDivider />
              </>
            )}
          <MenuLink to="/">
            <Icon icon="home" size="l" /> <span>主页</span>
          </MenuLink>
          {authenticated && (
            <>
              {showFollowing && (
                <MenuLink to="/following">
                  <Icon icon="following" size="l" /> <span>正在关注</span>
                </MenuLink>
              )}
              <MenuLink to="/mentions">
                <Icon icon="at" size="l" /> <span>提及（未完成）</span>
              </MenuLink>
              <MenuLink to="/notifications">
                <Icon icon="notification" size="l" /> <span>通知</span>
                {snapStates.notificationsShowNew && (
                  <sup title="New" style={{ opacity: 0.5 }}>
                    {' '}
                    &bull;
                  </sup>
                )}
              </MenuLink>
              <MenuDivider />
              <MenuLink to="/l">
                <Icon icon="list" size="l" /> <span>列表</span>
              </MenuLink>
              <MenuLink to="/ft">
                <Icon icon="hashtag" size="l" /> <span>关注标签（未完成）</span>
              </MenuLink>
              <MenuLink to="/b">
                <Icon icon="bookmark" size="l" /> <span>书签</span>
              </MenuLink>
              <MenuLink to="/f">
                <Icon icon="heart" size="l" /> <span>最爱</span>
              </MenuLink>
            </>
          )}
          <MenuDivider />
          <MenuLink to={`/search`}>
            <Icon icon="search" size="l" /> <span>搜索</span>
          </MenuLink>
          <MenuLink to={`/${instance}/p/l`}>
            <Icon icon="group" size="l" /> <span>本地时间线</span>
          </MenuLink>
          <MenuLink to={`/${instance}/p`}>
            <Icon icon="earth" size="l" /> <span>联邦时间线</span>
          </MenuLink>
          <MenuLink to={`/${instance}/trending`}>
            <Icon icon="chart" size="l" /> <span>趋势（未完成）</span>
          </MenuLink>
        </section>
        <section>
          {authenticated ? (
            <>
              <MenuDivider />
              {currentAccount?.info?.id && (
                <MenuLink to={`/${instance}/a/${currentAccount.info.id}`}>
                  <Icon icon="user" size="l" /> <span>个人资料</span>
                </MenuLink>
              )}
              <MenuItem
                onClick={() => {
                  states.showAccounts = true;
                }}
              >
                <Icon icon="group" size="l" /> <span>账号设置&hellip;</span>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  states.showShortcutsSettings = true;
                }}
              >
                <Icon icon="shortcut" size="l" />{' '}
                <span>界面设置&hellip;</span>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  window.location.href = 'https://meow.day/settings/user';
                }}
              >
                <Icon icon="gear" size="l" /> <span>其他设置&hellip;</span>
              </MenuItem>
            </>
          ) : (
            <>
              <MenuDivider />
              <MenuLink to="/login">
                <Icon icon="user" size="l" /> <span>Log in</span>
              </MenuLink>
            </>
          )}
        </section>
      </ControlledMenu>
    </>
  );
}

export default NavMenu;
