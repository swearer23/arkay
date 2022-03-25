import fsExtra from "fs-extra";
import { execSync } from "child_process";
import { readdirSync, writeFileSync } from "fs";
import logger from "./utils/logger.js";
import { validateUserConfig } from "./utils/gitlabClient.js";
import * as prompt from "./utils/prompt.js";
import os from 'os';
import { ARKAY_META_TEMPLATE } from "./consts.js";
const { emptyDirSync, removeSync, writeJsonSync, readJsonSync } = fsExtra;

const storyMainTempalte = `
const path = require('path');
module.exports = {
  "core": {
    builder: "webpack5",
  },
  "stories": [
    "../components/**/*.stories.mdx",
    "../components/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ],
  "framework": "@storybook/vue",
  webpackFinal: async (config, { configType }) => {
    config.module.rules.push({
      test: /\.scss$/,
      use: ['style-loader', 'css-loader', 'sass-loader'],
      include: path.resolve(__dirname, '../'),
    }, {
      test: /\.less$/,
      use: ['style-loader', 'css-loader', 'less-loader'],
      include: path.resolve(__dirname, '../'),
    });

    return config;
  }
}`;

const checkIfFolderEmpty = () => {
  const res = readdirSync(process.cwd());
  return !res.length;
};

const forcefullyCleanContent = () => {
  console.log("==> forcefully cleaning content");
  emptyDirSync(process.cwd());
};

const initStorybook = (extraOptions) => {
  execSync("npm init -y", { stdio: "inherit" });
  execSync("npx sb init --type vue --builder webpack5", { stdio: [0, 1, 2] });
  removeSync("./stories");
  execSync("mkdir components", { stdio: [0, 1, 2] });
  writeFileSync("./.storybook/main.js", storyMainTempalte, "utf8");
  writeJsonSync(
    "./.arkay.config.json",
    Object.assign({}, extraOptions, ARKAY_META_TEMPLATE),
    { spaces: 2 }
  );
};

const postSBInitForVue2 = () => {
  execSync("npm install vue@2 vue-template-compiler", { stdio: [0, 1, 2] });
};

const enableWebpack = () => {
  execSync("npm install webpack@5 --save-dev", {
    stdio: [0, 1, 2],
  });
};

const enableSass = () => {
  execSync("npm install sass sass-loader --save-dev", {
    stdio: [0, 1, 2],
  });
};

const enableLess = () => {
  execSync("npm install less less-loader --save-dev", {
    stdio: [0, 1, 2],
  });
};

const postSBInit = () => {
  postSBInitForVue2();
  enableWebpack();
  enableSass();
  enableLess();
  execSync("npm install lerna", { stdio: [0, 1, 2] });
  execSync("npx lerna init && git init", { stdio: [0, 1, 2] });
  execSync('touch .gitignore && echo "node_modules" >> .gitignore', {
    stdio: [0, 1, 2],
  });
  execSync('touch .gitignore && echo "packages/*" >> .gitignore', {
    stdio: [0, 1, 2],
  });
  writeJsonSync(
    "./lerna.json",
    Object.assign(readJsonSync("./lerna.json"), {
      packages: ["components/*"],
    }),
    { spaces: 2 }
  );
};

export const onMaterialAdded = () => {
  logger.info("bootstraping sub packages");
  execSync("npx lerna bootstrap", { stdio: [0, 1, 2] });
};

export const create = (isForcefully, extraOptions) => {
  if (!checkIfFolderEmpty()) {
    if (isForcefully) {
      forcefullyCleanContent();
    } else {
      logger.warn("current folder is NOT EMPTY");
      logger.warn("use [--force] flag to forcefully override existing content");
      return;
    }
  }
  initStorybook(extraOptions);
  postSBInit();
  logger.info("new workspace created");
};

export const hoist = () => {
  execSync("npx lerna bootstrap", { stdio: [0, 1, 2] });
};

export const initUserConfig = async () => {
  const { git_username, gitlab_host, gitlab_token } = await prompt.initUserConfigPrompt()
  const valid = await validateUserConfig(git_username, gitlab_host, gitlab_token)
  if (valid) {
    writeJsonSync(`${os.homedir()}/.arkayrc`, {
      git_username,
      gitlab_host,
      gitlab_token,
    }, { spaces: 2 })
  }
}
