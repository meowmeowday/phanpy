import './login.css';

import { useEffect, useRef, useState } from 'preact/hooks';
import { useSearchParams } from 'react-router-dom';

import logo from '../assets/logo.svg';

import Link from '../components/link';
import Loader from '../components/loader';
import instancesListURL from '../data/instances.json?url';
import { getAuthorizationURL, registerApplication } from '../utils/auth';
import store from '../utils/store';
import useTitle from '../utils/useTitle';

const { PHANPY_DEFAULT_INSTANCE: DEFAULT_INSTANCE } = import.meta.env;

function Login() {
  useTitle('Log in');
  const instanceURLRef = useRef();
  const cachedInstanceURL = store.local.get('instanceURL');
  const [uiState, setUIState] = useState('default');
  const [searchParams] = useSearchParams();
  const instance = searchParams.get('instance');
  const submit = searchParams.get('submit');
  const [instanceText, setInstanceText] = useState(
    instance || cachedInstanceURL?.toLowerCase() || 'meow.day',
  );

  const [instancesList, setInstancesList] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(instancesListURL);
        const data = await res.json();
        setInstancesList(data);
      } catch (e) {
        // Silently fail
        console.error(e);
      }
    })();
  }, []);

  // useEffect(() => {
  //   if (cachedInstanceURL) {
  //     instanceURLRef.current.value = cachedInstanceURL.toLowerCase();
  //   }
  // }, []);

  const submitInstance = (instanceURL) => {
    if (!instanceURL) return;
    store.local.set('instanceURL', instanceURL);

    (async () => {
      setUIState('loading');
      try {
        const { client_id, client_secret, vapid_key } =
          await registerApplication({
            instanceURL,
          });

        if (client_id && client_secret) {
          store.session.set('clientID', client_id);
          store.session.set('clientSecret', client_secret);
          store.session.set('vapidKey', vapid_key);

          location.href = await getAuthorizationURL({
            instanceURL,
            client_id,
          });
        } else {
          alert('Failed to register application');
        }
        setUIState('default');
      } catch (e) {
        console.error(e);
        setUIState('error');
      }
    })();
  };

  const cleanInstanceText = instanceText
    ? instanceText
        .replace(/^https?:\/\//, '') // Remove protocol from instance URL
        .replace(/\/+$/, '') // Remove trailing slash
        .replace(/^@?[^@]+@/, '') // Remove @?acct@
        .trim()
    : null;
  const instanceTextLooksLikeDomain =
    /[^\s\r\n\t\/\\]+\.[^\s\r\n\t\/\\]+/.test(cleanInstanceText) &&
    !/[\s\/\\@]/.test(cleanInstanceText);

  const instancesSuggestions = cleanInstanceText
    ? instancesList
        .filter((instance) => instance.includes(instanceText))
        .sort((a, b) => {
          // Move text that starts with instanceText to the start
          const aStartsWith = a
            .toLowerCase()
            .startsWith(instanceText.toLowerCase());
          const bStartsWith = b
            .toLowerCase()
            .startsWith(instanceText.toLowerCase());
          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;
          return 0;
        })
        .slice(0, 10)
    : [];

  const selectedInstanceText = instanceTextLooksLikeDomain
    ? cleanInstanceText
    : instancesSuggestions?.length
    ? instancesSuggestions[0]
    : instanceText
    ? instancesList.find((instance) => instance.includes(instanceText))
    : null;

  const onSubmit = (e) => {
    e.preventDefault();
    // const { elements } = e.target;
    // let instanceURL = elements.instanceURL.value.toLowerCase();
    // // Remove protocol from instance URL
    // instanceURL = instanceURL.replace(/^https?:\/\//, '').replace(/\/+$/, '');
    // // Remove @acct@ or acct@ from instance URL
    // instanceURL = instanceURL.replace(/^@?[^@]+@/, '');
    // if (!/\./.test(instanceURL)) {
    //   instanceURL = instancesList.find((instance) =>
    //     instance.includes(instanceURL),
    //   );
    // }
    // submitInstance(instanceURL);
    submitInstance(selectedInstanceText);
  };

  if (submit) {
    useEffect(() => {
      submitInstance(instance || selectedInstanceText);
    }, []);
  }

  return (
    <main id="login" style={{ textAlign: 'center' }}>
      <form onSubmit={onSubmit}>
        <h1>
          <img src={logo} alt="" width="80" height="80" />
          <br />
          Log in
        </h1>
        <label>
          <p>Instance</p>
          <input
            value={instanceText}
            required
            type="text"
            class="large"
            id="instanceURL"
            ref={instanceURLRef}
            disabled={uiState === 'loading'}
            // list="instances-list"
            autocorrect="off"
            autocapitalize="off"
            autocomplete="off"
            spellCheck={false}
            placeholder="instance domain"
            onInput={(e) => {
              setInstanceText(e.target.value);
            }}
          />
          {instancesSuggestions?.length > 0 ? (
            <ul id="instances-suggestions">
              {instancesSuggestions.map((instance, i) => (
                <li>
                  <button
                    type="button"
                    class="plain5"
                    onClick={() => {
                      submitInstance(instance);
                    }}
                  >
                    {instance}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div id="instances-eg">e.g. &ldquo;meow.day&rdquo;</div>
          )}
          {/* <datalist id="instances-list">
            {instancesList.map((instance) => (
              <option value={instance} />
            ))}
          </datalist> */}
        </label>
        {uiState === 'error' && (
          <p class="error">
            登录失败，请再试一次
          </p>
        )}
        <div>
          <button
            disabled={
              uiState === 'loading' || !instanceText || !selectedInstanceText
            }
          >
            {selectedInstanceText
              ? `登录到 ${selectedInstanceText}站`
              : '登录'}
          </button>{' '}
        </div>
        <Loader hidden={uiState !== 'loading'} />
        <hr />
        {!DEFAULT_INSTANCE && (
        <p class="insignificant">
            <small>
            <a href="https://meow.day/signup" target="_blank">
            还没有账户？快来注册吧！
            </a>
              <br />
            <a href="https://meow.day/about" target="_blank">
            查看站点信息
            </a>
              <br />
            <a href="https://meow.meow.day/#/meow.day/p" target="_blank">
            预览本站
            </a>
            </small>
          </p>
          )}
        <p>
          <Link to="/">返回主页</Link>
        </p>

      </form>
    </main>
  );
}

export default Login;
