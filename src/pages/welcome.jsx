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

function Welcome() {
  useTitle(null, ['/', '/welcome']);
  return (
    <main id="welcome">
      <div class="hero-container">
        <h1>
          <img
            src={logo}
            alt=""
            width="200"
            height="200"
            style={{
              aspectRatio: '1/1',
              marginBlockEnd: -16,
            }}
          />
          <img src={logoText} alt="Phanpy" width="250" />
        </h1>
        <p>
          <big>
            <b>
              <Link to="/login" class="button">
                进来！
              </Link>
            </b>
          </big>
        </p>
        <p class="desc">meow.day, 又一个ActivityPub实例</p>
        <p>
          <a href="https://forms.meow.day/s/clnjw0kwr0001oa01te98qd1n" target="_blank">
            还没有账户？快来注册吧！
          </a>
        </p>
        <p>
          <a href="https://meow.day/about" target="_blank">
            查看站点信息
          </a>
        </p>
        <p>
          <a href="https://meow.meow.day/#/meow.day/p" target="_blank">
            预览本站
          </a>
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
      <footer>
        <hr />
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
          <a
            href="https://github.com/cheeaun/phanpy/blob/main/PRIVACY.MD"
            target="_blank"
          >
            Privacy Policy
          </a>
          .
        </p>
      </footer>
    </main>
  );
}

export default Welcome;