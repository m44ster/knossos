<template>
  <div class="page-container">
    <div class="page-contents">
      <section class="project-info">
        <div class="header">
          <img
            class="icon"
            :src="
              project.icon_url
                ? project.icon_url
                : 'https://cdn.modrinth.com/placeholder.svg?inline'
            "
            alt="project - icon"
          />
          <h1 class="title">{{ project.title }}</h1>
          <div class="side-descriptor">
            <InfoIcon />
            Client mod
          </div>
          <div class="buttons">
            <nuxt-link
              v-if="$auth.user"
              :to="`/report/create?id=${project.id}&t=project`"
              class="iconified-button"
            >
              <ReportIcon />
              Report
            </nuxt-link>
            <button
              v-if="
                $auth.user && !$user.follows.find((x) => x.id === project.id)
              "
              class="iconified-button"
              @click="$store.dispatch('user/followProject', project)"
            >
              <FollowIcon />
              Follow
            </button>
            <button
              v-if="
                $auth.user && $user.follows.find((x) => x.id === project.id)
              "
              class="iconified-button"
              @click="$store.dispatch('user/unfollowProject', project)"
            >
              <FollowIcon fill="currentColor" />
              Unfollow
            </button>
          </div>
          <p class="description">
            {{ project.description }}
          </p>
          <p class="categories">
            <span
              v-for="(category, index) in project.categories"
              :key="category"
            >
              {{
                index === project.categories.length - 1
                  ? category.charAt(0).toUpperCase() + category.slice(1)
                  : category.charAt(0).toUpperCase() + category.slice(1) + ' · '
              }}
            </span>
          </p>
          <div class="stats">
            <span class="stat">{{ formatNumber(project.downloads) }}</span>
            <span class="label">downloads</span>
            <span class="stat">{{ formatNumber(project.followers) }}</span>
            <span class="label">followers</span>
          </div>
          <div class="dates">
            <div class="date">
              <CalendarIcon />
              <span class="label">Created</span>
              <span class="value">{{
                $dayjs(project.published).fromNow()
              }}</span>
            </div>
            <div class="date">
              <UpdateIcon />
              <span class="label">Updated</span>
              <span class="value">{{ $dayjs(project.updated).fromNow() }}</span>
            </div>
          </div>
        </div>
        <div v-if="featuredVersions.length > 0" class="section">
          <h3 class="section-title">Featured versions</h3>
          <div
            v-for="version in featuredVersions"
            :key="version.id"
            class="featured-version"
          >
            <a
              :href="findPrimary(version).url"
              class="download"
              @click.prevent="
                downloadFile(
                  findPrimary(version).hashes.sha1,
                  findPrimary(version).url
                )
              "
            >
              <DownloadIcon />
            </a>
            <div class="info">
              <div class="top">
                <span
                  v-if="version.version_type === 'release'"
                  class="badge green"
                >
                  Release
                </span>
                <span
                  v-if="version.version_type === 'beta'"
                  class="badge yellow"
                >
                  Beta
                </span>
                <span v-if="version.version_type === 'alpha'" class="badge red">
                  Alpha
                </span>
                <h4 class="title">
                  <nuxt-link
                    :to="
                      '/project/' +
                      (project.slug ? project.slug : project.id) +
                      '/version/' +
                      encodeURIComponent(version.version_number)
                    "
                  >
                    {{ version.name }}
                  </nuxt-link>
                </h4>
              </div>
              <div class="bottom">
                <span class="version-number limit-text-width">
                  {{ version.version_number }} ·
                </span>
                <FabricIcon
                  v-if="version.loaders.includes('fabric')"
                  class="loader"
                />
                <ForgeIcon
                  v-if="version.loaders.includes('forge')"
                  class="loader"
                />
                <span
                  v-if="version.game_versions.length > 0"
                  class="game-version limit-text-width"
                >
                  ·
                  {{ version.game_versions[version.game_versions.length - 1] }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="section">
          <h3>Project members</h3>
          <div
            v-for="member in members"
            :key="member.user_id"
            class="team-member columns"
          >
            <img :src="member.avatar_url" alt="profile-picture" />
            <div class="member-info">
              <nuxt-link :to="'/user/' + member.user.username">
                <p>{{ member.name }}</p>
              </nuxt-link>
              <p class="role">{{ member.role }}</p>
            </div>
          </div>
        </div>
        <div
          v-if="project.donation_urls && project.donation_urls.length > 0"
          class="section"
        >
          <h3>Donation Links</h3>
          <div
            v-for="(item, index) in project.donation_urls"
            :key="index"
            class="links"
          >
            <a :href="item.url" class="link">
              <ExternalIcon />
              {{ item.platform }}
            </a>
          </div>
        </div>
        <Advertisement
          v-if="project.status === 'approved' || project.status === 'unlisted'"
          type="square"
          small-screen="destroy"
        />
      </section>
      <div class="content">
        <div class="project-main">
          <div class="tabs">
            <nuxt-link
              :to="'/project/' + (project.slug ? project.slug : project.id)"
              class="tab"
            >
              <span>Description</span>
            </nuxt-link>
            <nuxt-link
              :to="
                '/project/' +
                (project.slug ? project.slug : project.id) +
                '/versions'
              "
              class="tab"
            >
              <span>Versions</span>
            </nuxt-link>
            <nuxt-link
              v-if="currentMember"
              :to="'/project/' + project.id + '/settings'"
              class="tab"
            >
              <SettingsIcon />
              <span>Settings</span>
            </nuxt-link>
          </div>
          <div class="project-content">
            <NuxtChild
              :project="project"
              :versions="versions"
              :featured-versions="featuredVersions"
              :members="members"
              :current-member="currentMember"
              :all-members="allMembers"
              :link-bar.sync="linkBar"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CalendarIcon from '~/assets/images/utils/calendar.svg?inline'
import DownloadIcon from '~/assets/images/utils/download.svg?inline'
import UpdateIcon from '~/assets/images/utils/updated.svg?inline'
import CodeIcon from '~/assets/images/sidebar/mod.svg?inline'
import ReportIcon from '~/assets/images/utils/report.svg?inline'
import FollowIcon from '~/assets/images/utils/heart.svg?inline'
import InfoIcon from '~/assets/images/utils/info.svg?inline'

import ExternalIcon from '~/assets/images/utils/external.svg?inline'
import SettingsIcon from '~/assets/images/utils/settings.svg?inline'

import ForgeIcon from '~/assets/images/categories/forge.svg?inline'
import FabricIcon from '~/assets/images/categories/fabric.svg?inline'
import Advertisement from '~/components/ads/Advertisement'

export default {
  components: {
    Advertisement,
    ExternalIcon,
    SettingsIcon,
    ForgeIcon,
    FabricIcon,
    DownloadIcon,
    CalendarIcon,
    UpdateIcon,
    // eslint-disable-next-line vue/no-unused-components
    CodeIcon,
    ReportIcon,
    FollowIcon,
    InfoIcon,
  },
  async asyncData(data) {
    try {
      const [project, members, versions, featuredVersions] = (
        await Promise.all([
          data.$axios.get(`project/${data.params.id}`, data.$auth.headers),
          data.$axios.get(
            `project/${data.params.id}/members`,
            data.$auth.headers
          ),
          data.$axios.get(`project/${data.params.id}/version`),
          data.$axios.get(`project/${data.params.id}/version?featured=true`),
        ])
      ).map((it) => it.data)

      members.forEach((it, index) => {
        members[index].avatar_url = it.user.avatar_url
        members[index].name = it.user.username
      })

      const currentMember = data.$auth.user
        ? members.find((x) => x.user.id === data.$auth.user.id)
        : null

      if (project.body_url && !project.body) {
        project.body = (await data.$axios.get(project.body_url)).data
      }

      return {
        project,
        versions,
        featuredVersions,
        members: members.filter((x) => x.accepted),
        allMembers: members,
        currentMember,
        linkBar: [],
      }
    } catch {
      data.error({
        statusCode: 404,
        message: 'Project not found',
      })
    }
  },
  head() {
    return {
      title: this.project.title + ' - Modrinth',
      meta: [
        {
          hid: 'og:type',
          name: 'og:type',
          content: 'website',
        },
        {
          hid: 'og:title',
          name: 'og:title',
          content: this.project.title,
        },
        {
          hid: 'apple-mobile-web-app-title',
          name: 'apple-mobile-web-app-title',
          content: this.project.title,
        },
        {
          hid: 'og:description',
          name: 'og:description',
          content: this.project.description,
        },
        {
          hid: 'description',
          name: 'description',
          content:
            this.project.description +
            ' View other minecraft projects on Modrinth today! Modrinth is a new and modern Minecraft modding platform supporting both the Forge and Fabric project loaders.',
        },
        {
          hid: 'og:url',
          name: 'og:url',
          content: `https://modrinth.com/project/${this.project.id}`,
        },
        {
          hid: 'og:image',
          name: 'og:image',
          content: this.project.icon_url
            ? this.project.icon_url
            : 'https://cdn.modrinth.com/placeholder.png',
        },
      ],
    }
  },
  methods: {
    formatNumber(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
    findPrimary(version) {
      let file = version.files.find((x) => x.primary)

      if (!file) {
        file = version.files[0]
      }

      if (!file) {
        file = { url: `/project/${this.project.id}/version/${version.id}` }
      }

      return file
    },
    async downloadFile(hash, url) {
      await this.$axios.get(`version_file/${hash}/download`)

      const elem = document.createElement('a')
      elem.download = hash
      elem.href = url
      elem.click()
    },
  },
}
</script>

<style lang="scss" scoped>
.header {
  align-items: center;
  padding: 0 1.5rem 1rem 1.5rem;
  margin-top: 3rem;

  @extend %card-spaced-b;

  .icon {
    width: 6rem;
    height: 6rem;
    object-fit: contain;
    margin: -3rem 0 0 0;
    border-radius: var(--size-rounded-icon);
  }

  .title {
    margin: 0.25rem 0;
    color: var(--color-text-dark);
    font-size: var(--font-size-2xl);
  }

  .side-descriptor {
    display: flex;
    align-items: center;
    color: var(--color-text-dark);
    font-weight: bold;
    font-size: var(--font-size-sm);
    margin-bottom: 0.5rem;

    svg {
      height: 1.25rem;
      margin-right: 0.125rem;
    }
  }

  .buttons {
    @extend %row;

    button,
    a {
      max-height: 2rem;
      border-radius: 2rem;
      margin: 0 0.25rem 0 0;
      padding: 0.2rem 0.5rem;
      display: flex;
    }
  }

  .description {
    margin-top: var(--spacing-card-sm);
    margin-bottom: 0.5rem;
    color: var(--color-text-dark);
    font-size: var(--font-size-sm);
  }

  .categories {
    margin: 0.75rem 0;
    font-size: var(--font-size-sm);
    font-weight: bold;
  }

  .stats {
    .stat {
      font-size: var(--font-size-xl);
      font-weight: bold;
    }
    .label {
      margin-right: 0.125rem;
    }
  }

  .dates {
    margin-top: 0.75rem;
    .date {
      font-size: var(--font-size-sm);
      display: flex;
      align-items: center;
      margin-bottom: 0.25rem;

      .label {
        font-weight: lighter;
        margin-right: 0.25rem;
      }

      .value {
        font-weight: bold;
      }

      svg {
        height: 1.25rem;
        margin-right: 0.25rem;
      }
    }
  }
}

.project-main {
  @extend %card-spaced-b;
  padding: 0 1rem;
  margin-top: 3rem;

  .tabs {
    overflow-x: auto;
    padding: 0;

    .tab {
      padding: 0;
      margin: 0.9rem 0.5rem 0.8rem 0.5rem;
      &:first-child {
        margin-left: 0;
      }
      &:last-child {
        margin-right: 0;
      }
    }
  }
}

.project-info {
  height: auto;
  overflow: hidden;

  @media screen and (min-width: 1024px) {
    width: 32rem;
    margin-right: var(--spacing-card-lg);
  }

  .section {
    @extend %card-spaced-b;
    padding: var(--spacing-card-bg);
  }

  h3 {
    font-weight: bold;
    color: var(--color-text);
    margin-bottom: 0.25rem;
  }

  .team-member {
    margin-left: 5px;
    margin-bottom: 10px;

    img {
      border-radius: var(--size-rounded-icon);
      height: 50px;
      width: 50px;
    }
    .member-info {
      max-width: 150px;
      overflow: hidden;
      margin: auto 0 auto 0.5rem;
      h4 {
        font-weight: normal;
        margin: 0;
      }
      h3 {
        margin-top: 0.1rem;
        margin-bottom: 0;
      }
    }
  }

  .featured-version {
    @extend %row;
    padding-top: var(--spacing-card-sm);
    padding-bottom: var(--spacing-card-sm);
    .download {
      display: flex;
      align-items: center;
      height: 2.25rem;
      width: 2.25rem;
      border-radius: 2rem;
      background-color: var(--color-button-bg);
      margin-right: var(--spacing-card-sm);
      svg {
        width: 1.25rem;
        margin: auto;
      }
      flex-shrink: 0;
    }
    .info {
      @extend %column;
      font-size: var(--font-size-xs);
      .top {
        @extend %row;
        .badge {
          font-size: var(--font-size-xs);
          margin-right: var(--spacing-card-sm);
        }
        .title {
          margin: auto 0;
        }
      }
      .bottom {
        margin-top: 0.25rem;
        @extend %row;
        .loader {
          height: 0.75rem;
        }
      }
    }
  }

  .links {
    padding: 0.5rem 1rem;

    .link {
      display: flex;
      align-items: center;
      padding: 0.25rem 0;

      svg {
        width: 1rem;
        height: 1rem;
        margin-right: 0.3rem;
      }

      &:hover,
      &:focus {
        padding-bottom: calc(0.25rem - 3px);
        border-bottom: 3px solid var(--color-brand-disabled);
        color: var(--color-text-medium);
      }
    }
  }
}

.limit-text-width {
  display: inline-block;
  height: 1em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media screen and (max-width: 550px) {
  .title a {
    display: none;
  }
}

@media screen and (max-width: 800px) {
  .project-navigation {
    display: block;
    overflow-x: auto;
    overflow-wrap: break-word;
    overflow-y: hidden;
  }
}
</style>
