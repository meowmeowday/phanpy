import './nav-menu.css';

import { Trans, useLingui } from '@lingui/react/macro';
import { ControlledMenu, MenuDivider, MenuItem } from '@szhsin/react-menu';
import { memo } from 'preact/compat';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { useLongPress } from 'use-long-press';
import { useSnapshot } from 'valtio';

import { api } from '../utils/api';
import { getLists } from '../utils/lists';
import safeBoundingBoxPadding from '../utils/safe-bounding-box-padding';
import states from '../utils/states';
import store from '../utils/store';
import { getAccounts, getCurrentAccountID } from '../utils/store-utils';
import supports from '../utils/supports';

import Avatar from './avatar';
import Icon from './icon';
import ListExclusiveBadge from './list-exclusive-badge';
import MenuLink from './menu-link';
import SubMenu2 from './submenu2';

function NavMenu(props) {
  const { t } = useLingui();
  const snapStates = useSnapshot(states);
  const { masto, instance, authenticated } = api();

  const [currentAccount, moreThanOneAccount] = useMemo(() => {
    const accounts = getAccounts();
    const acc =
      accounts.find((account) => account.info.id === getCurrentAccountID()) ||
      accounts[0];
    return [acc, accounts.length > 1];
  }, []);

  // Home = Following
  // But when in multi-column mode, Home becomes columns of anything
  // User may choose pin or not to pin Following
  // If user doesn't pin Following, we show it in the menu
  const showFollowing =
    (snapStates.settings.shortcutsViewMode === 'multi-column' ||
      (!snapStates.settings.shortcutsViewMode &&
        snapStates.settings.shortcutsColumnsMode)) &&
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

  const mutesIterator = useRef();
  async function fetchMutes(firstLoad) {
    if (firstLoad || !mutesIterator.current) {
      mutesIterator.current = masto.v1.mutes
        .list({
          limit: 80,
        })
        .values();
    }
    const results = await mutesIterator.current.next();
    return results;
  }

  const blocksIterator = useRef();
  async function fetchBlocks(firstLoad) {
    if (firstLoad || !blocksIterator.current) {
      blocksIterator.current = masto.v1.blocks
        .list({
          limit: 80,
        })
        .values();
    }
    const results = await blocksIterator.current.next();
    return results;
  }

  const buttonClickTS = useRef();
  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        class={`button plain nav-menu-button ${
          moreThanOneAccount ? 'with-avatar' : ''
        } ${menuState === 'open' ? 'active' : ''}`}
        style={{ position: 'relative' }}
        onClick={() => {
          buttonClickTS.current = Date.now();
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
        <Icon icon="menu" size={moreThanOneAccount ? 's' : 'l'} alt={t`Menu`} />
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
            if (Date.now() - buttonClickTS.current < 300) {
              return;
            }
            // setMenuState(undefined);
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
        {!!snapStates.appVersion?.commitHash &&
          __COMMIT_HASH__ !== snapStates.appVersion.commitHash && (
            <div class="top-menu">
              <MenuItem
                onClick={() => {
                  const yes = confirm(t`Reload page now to update?`);
                  if (yes) {
                    (async () => {
                      try {
                        location.reload();
                      } catch (e) {}
                    })();
                  }
                }}
              >
                <Icon icon="sparkles" class="sparkle-icon" size="l" />{' '}
                <span>
                  <Trans>New update available…</Trans>
                </span>
              </MenuItem>
              <MenuDivider />
            </div>
          )}
        <section>
          <MenuLink to="/">
            <Icon icon="home" size="l" />{' '}
            <span>
              <Trans>Home</Trans>
            </span>
          </MenuLink>
          {authenticated ? (
            <>
              {showFollowing && (
                <MenuLink to="/following">
                  <Icon icon="following" size="l" />{' '}
                  <span>
                    <Trans id="following.title">Following</Trans>
                  </span>
                </MenuLink>
              )}
              <MenuLink to="/catchup">
                <Icon icon="history2" size="l" />
                <span>
                  <Trans>Catch-up</Trans>
                </span>
              </MenuLink>
              {supports('@mastodon/mentions') && (
                <MenuLink to="/mentions">
                  <Icon icon="at" size="l" />{' '}
                  <span>
                    <Trans>Mentions</Trans>
                  </span>
                </MenuLink>
              )}
              <MenuLink to="/notifications">
                <Icon icon="notification" size="l" />{' '}
                <span>
                  <Trans>Notifications</Trans>
                </span>
                {snapStates.notificationsShowNew && (
                  <sup title={t`New`} style={{ opacity: 0.5 }}>
                    {' '}
                    &bull;
                  </sup>
                )}
              </MenuLink>
              <MenuDivider />
              {currentAccount?.info?.id && (
                <MenuLink to={`/${instance}/a/${currentAccount.info.id}`}>
                  <Icon icon="user" size="l" />{' '}
                  <span>
                    <Trans>Profile</Trans>
                  </span>
                </MenuLink>
              )}
              <ListMenu menuState={menuState} />
              <MenuLink to="/b">
                <Icon icon="bookmark" size="l" />{' '}
                <span>
                  <Trans>Bookmarks</Trans>
                </span>
              </MenuLink>
              <SubMenu2
                menuClassName="nav-submenu"
                overflow="auto"
                gap={-8}
                label={
                  <>
                    <Icon icon="more" size="l" />
                    <span class="menu-grow">
                      <Trans>More…</Trans>
                    </span>
                    <Icon icon="chevron-right" />
                  </>
                }
              >
                <MenuLink to="/f">
                  <Icon icon="heart" size="l" />{' '}
                  <span>
                    <Trans>Likes</Trans>
                  </span>
                </MenuLink>
                <MenuLink to="/fh">
                  <Icon icon="hashtag" size="l" />{' '}
                  <span>
                    <Trans>Followed Hashtags</Trans>
                  </span>
                </MenuLink>
                <MenuLink to="/sp">
                  <Icon icon="schedule" size="l" />{' '}
                  <span>
                    <Trans>Scheduled Posts</Trans>
                  </span>
                </MenuLink>
                <MenuDivider />
                {supports('@mastodon/filters') && (
                  <MenuLink to="/ft">
                    <Icon icon="filters" size="l" />{' '}
                    <span>
                      <Trans>Filters</Trans>
                    </span>
                  </MenuLink>
                )}
                <MenuItem
                  onClick={() => {
                    states.showGenericAccounts = {
                      id: 'mute',
                      heading: t`Muted users`,
                      fetchAccounts: fetchMutes,
                      excludeRelationshipAttrs: ['muting'],
                    };
                  }}
                >
                  <Icon icon="mute" size="l" />{' '}
                  <span>
                    <Trans>Muted users…</Trans>
                  </span>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    states.showGenericAccounts = {
                      id: 'block',
                      heading: t`Blocked users`,
                      fetchAccounts: fetchBlocks,
                      excludeRelationshipAttrs: ['blocking'],
                    };
                  }}
                >
                  <Icon icon="block" size="l" />{' '}
                  <span>
                    <Trans>Blocked users…</Trans>
                  </span>
                </MenuItem>{' '}
              </SubMenu2>
              <MenuDivider />
              <MenuItem
                onClick={() => {
                  window.open('https://meow.day/settings/user', '_blank');
                }}
              >
                <Icon icon="gear" size="l" /> <span>修改个人资料&hellip;</span>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  states.showAccounts = true;
                }}
              >
                <Icon icon="group" size="l" />{' '}
                <span>
                  <Trans>Accounts…</Trans>
                </span>
              </MenuItem>
            </>
          ) : (
            <>
              <MenuDivider />
              <MenuLink to="/login">
                <Icon icon="user" size="l" />{' '}
                <span>
                  <Trans>Log in</Trans>
                </span>
              </MenuLink>
            </>
          )}
        </section>
        <section>
          <MenuDivider />
          <MenuLink to={`/search`}>
            <Icon icon="search" size="l" />{' '}
            <span>
              <Trans>Search</Trans>
            </span>
          </MenuLink>
          <MenuLink to={`/${instance}/trending`}>
            <Icon icon="chart" size="l" />{' '}
            <span>
              <Trans>Trending</Trans>
            </span>
          </MenuLink>
          <MenuLink to={`/${instance}/p/l`}>
            <Icon icon="building" size="l" />{' '}
            <span>
              <Trans>Local</Trans>
            </span>
          </MenuLink>
          <MenuLink to={`/${instance}/p`}>
            <Icon icon="earth" size="l" />{' '}
            <span>
              <Trans>Federated</Trans>
            </span>
          </MenuLink>
          {authenticated ? (
            <>
              <MenuDivider className="divider-grow" />
              <MenuItem
                onClick={() => {
                  states.showKeyboardShortcutsHelp = true;
                }}
              >
                <Icon icon="keyboard" size="l" />{' '}
                <span>
                  <Trans>Keyboard shortcuts</Trans>
                </span>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  states.showShortcutsSettings = true;
                }}
              >
                <Icon icon="shortcut" size="l" />{' '}
                <span>
                  <Trans>Shortcuts / Columns…</Trans>
                </span>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  states.showSettings = true;
                }}
              >
                <Icon icon="gear" size="l" />{' '}
                <span>
                  <Trans>Settings…</Trans>
                </span>
              </MenuItem>
            </>
          ) : (
            <>
              <MenuDivider />
              <MenuItem
                onClick={() => {
                  states.showSettings = true;
                }}
              >
                <Icon icon="gear" size="l" />{' '}
                <span>
                  <Trans>Settings…</Trans>
                </span>
              </MenuItem>
            </>
          )}
        </section>
      </ControlledMenu>
    </>
  );
}

function ListMenu({ menuState }) {
  const supportsLists = supports('@mastodon/lists');
  const [lists, setLists] = useState([]);
  useEffect(() => {
    if (!supportsLists) return;
    if (menuState === 'open') {
      getLists().then(setLists);
    }
  }, [menuState, supportsLists]);

  return lists.length > 0 ? (
    <SubMenu2
      menuClassName="nav-submenu"
      overflow="auto"
      gap={-8}
      label={
        <>
          <Icon icon="list" size="l" />
          <span class="menu-grow">
            <Trans>Lists</Trans>
          </span>
          <Icon icon="chevron-right" />
        </>
      }
    >
      <MenuLink to="/l">
        <span>
          <Trans>All Lists</Trans>
        </span>
      </MenuLink>
      {lists?.length > 0 && (
        <>
          <MenuDivider />
          {lists.map((list) => (
            <MenuLink key={list.id} to={`/l/${list.id}`}>
              <span>
                {list.title}
                {list.exclusive && (
                  <>
                    {' '}
                    <ListExclusiveBadge />
                  </>
                )}
              </span>
            </MenuLink>
          ))}
        </>
      )}
    </SubMenu2>
  ) : (
    supportsLists && (
      <MenuLink to="/l">
        <Icon icon="list" size="l" />
        <span>
          <Trans>Lists</Trans>
        </span>
      </MenuLink>
    )
  );
}

export default memo(NavMenu);
