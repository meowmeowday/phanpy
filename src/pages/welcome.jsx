import './welcome.css';

import boostsCarouselUrl from '../assets/features/boosts-carousel.jpg';
import groupedNotificationsUrl from '../assets/features/grouped-notifications.jpg';
import multiColumnUrl from '../assets/features/multi-column.jpg';
import multiHashtagTimelineUrl from '../assets/features/multi-hashtag-timeline.jpg';
import nestedCommentsThreadUrl from '../assets/features/nested-comments-thread.jpg';
import logoText from '../assets/logo-text.svg';
import logo from '../assets/logo.svg';

import Link from '../components/link';
import states from '../utils/states';
import useTitle from '../utils/useTitle';

const {
  PHANPY_DEFAULT_INSTANCE: DEFAULT_INSTANCE,
  PHANPY_WEBSITE: WEBSITE,
  PHANPY_PRIVACY_POLICY_URL: PRIVACY_POLICY_URL,
  PHANPY_DEFAULT_INSTANCE_REGISTRATION_URL: DEFAULT_INSTANCE_REGISTRATION_URL,
} = import.meta.env;
const appSite = WEBSITE
  ? WEBSITE.replace(/https?:\/\//g, '').replace(/\/$/, '')
  : null;
const appVersion = __BUILD_TIME__
  ? `${__BUILD_TIME__.slice(0, 10).replace(/-/g, '.')}${
      __COMMIT_HASH__ ? `.${__COMMIT_HASH__}` : ''
    }`
  : null;

function Welcome() {
  useTitle(null, ['/', '/welcome']);
  return (
    <main id="welcome">
      <div class="hero-container">
        <div class="hero-content">
          <h1>
            <img
              src={logo}
              alt=""
              width="160"
              height="160"
              style={{
                aspectRatio: '1/1',
                marginBlockEnd: -16,
              }}
            />
            <img src={logoText} alt="Phanpy" width="200" />
          </h1>
          <p class="desc">meow.day, 一个Fediverse实例。</p>
          <p>
            <Link
              to={
                DEFAULT_INSTANCE
                  ? `/login?instance=${DEFAULT_INSTANCE}&submit=1`
                  : '/login'
              }
              class="button"
            >
              {DEFAULT_INSTANCE ? 'Log in' : '进来！'}
            </Link>
          </p>
          {DEFAULT_INSTANCE && DEFAULT_INSTANCE_REGISTRATION_URL && (
            <p>
              <a href={DEFAULT_INSTANCE_REGISTRATION_URL} class="button plain5">
                Sign up
              </a>
            </p>
          )}
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
        </div>
        {(appSite || appVersion) && (
          <p class="app-site-version">
            <small>
              {appSite} {appVersion}
            </small>
          </p>
        )}
        <p>
          <a href="https://github.com/cheeaun/phanpy" target="_blank">
            Built
          </a>{' '}
          by{' '}
          <a
            href="https://mastodon.social/@cheeaun"
            target="_blank"
            onClick={(e) => {
              e.preventDefault();
              states.showAccount = 'cheeaun@mastodon.social';
            }}
          >
            @cheeaun
          </a>
          .{' '}
          <a href={PRIVACY_POLICY_URL} target="_blank">
            Privacy Policy
          </a>
          .
        </p>
      </div>
      <div id="why-container">
        <div class="sections">
          <section>
            <img
              src={boostsCarouselUrl}
              alt="Screenshot of Boosts Carousel"
              loading="lazy"
            />
            <h4>聚合转嘟</h4>
            <p>
              在时间线上将原创嘟文和转嘟分开显示。
            </p>
          </section>
          <section>
            <img
              src={nestedCommentsThreadUrl}
              alt="Screenshot of nested comments thread"
              loading="lazy"
            />
            <h4>聚合回复</h4>
            <p>利用折叠层级回复结构，轻松聚焦对话。</p>
          </section>
          <section>
            <img
              src={groupedNotificationsUrl}
              alt="Screenshot of grouped notifications"
              loading="lazy"
            />
            <h4>聚合通知</h4>
            <p>
              将不同用户对你的通知的互动聚合在一起。
            </p>
          </section>
          <section>
            <img
              src={multiColumnUrl}
              alt="Screenshot of multi-column UI"
              loading="lazy"
            />
            <h4>自定义页面栏目</h4>
            <p>
              在默认状态下，只会显示单栏页面，你可以自定义主页显示的栏目数。
            </p>
          </section>
          <section>
            <img
              src={multiHashtagTimelineUrl}
              alt="Screenshot of multi-hashtag timeline with a form to add more hashtags"
              loading="lazy"
            />
            <h4>多标签时间线</h4>
            <p>你可以在时间线上关注至多5个不同标签。</p>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Welcome;