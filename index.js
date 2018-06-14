/* eslint no-console: off */
const fetch = require('node-fetch');

let hcBackendUrl;

function toJson(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response.json();
}

function handleFetchErrors(error, defaultMessage) {
  let message = defaultMessage;
  if (error.code === 'ECONNREFUSED') {
    message = 'Is the human connection server running?';
  }
  throw Error(`${message}\nError: ${error.message}`);
}

async function findBySlug(models, slug) {
  try {
    const response = await fetch(`${hcBackendUrl}/${models}?slug=${slug}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await toJson(response);
    return json.data[0];
  } catch (error) {
    handleFetchErrors(error, `Cannot find a model of type ${models} by slug ${slug}`);
    return null;
  }
}

async function resolveSlugs(slugs) {
  const result = {};
  const { organization, categories } = slugs;
  if (organization) {
    const organizationModel = await findBySlug('organizations', organization);
    if (!organizationModel) throw (Error(`Cannot find organization "${organization}"\n${Error('Not Found')}`));
    // eslint-disable-next-line no-underscore-dangle
    result.organizationId = organizationModel._id;
  }
  if (categories) {
    result.categoryIds = [];
    categories.forEach(async (category) => {
      const categoryModel = await findBySlug('categories', category);
      if (!categoryModel) throw (Error(`Cannot find category "${category}"\n${Error('Not Found')}`));
      // eslint-disable-next-line no-underscore-dangle
      result.categoryIds.push(categoryModel._id);
    });
  }
  return result;
}

class User {
  constructor(params) {
    this.email = params.email;
    this.password = params.password;
  }
  async login() {
    const formData = {
      email: this.email,
      password: this.password,
      strategy: 'local',
    };

    try {
      const response = await fetch(`${hcBackendUrl}/authentication`, {
        method: 'post',
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await toJson(response);
      this.accessToken = json.accessToken;
      return true;
    } catch (error) {
      handleFetchErrors(error, 'Cannot log in.');
    }
    return null;
  }

  async contribute(contribution, options) {
    const contributionParams = contribution;

    if (options && options.resolveSlugs) {
      const additionalParams = await resolveSlugs(options.resolveSlugs);
      Object.assign(contributionParams, additionalParams);
    }

    let method = 'post';
    let url = `${hcBackendUrl}/contributions`;

    if (options && options.slug) {
      const existingContribution = await findBySlug('contributions', options.slug);
      if (existingContribution) {
        method = 'patch';
        // eslint-disable-next-line no-underscore-dangle
        url = `${hcBackendUrl}/contributions/${existingContribution._id}`;
      } else {
        contributionParams.slug = options.slug; // that's OK! Just create it with this slug.
      }
    }

    await this.login();

    try {
      const response = await fetch(url, {
        method,
        body: JSON.stringify(contributionParams),
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      const json = await toJson(response);
      return json;
    } catch (error) {
      handleFetchErrors(error, 'Cannot create post.');
    }
    return null;
  }
}

function connect(url) {
  hcBackendUrl = url;
}

module.exports = {
  User,
  connect,
};
