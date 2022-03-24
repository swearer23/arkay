import axios from "axios";
import fsExtra from "fs-extra";
import http from 'http'
import { AKATOSH_SERVER_ERROR, DUPLICATED_GIT_REPO_ERROR } from "./errors.js";

const { readJsonSync } = fsExtra;

export const createProject = async projectName => {
  const { akatoshServer, namespace, username, gitlabToken } = readJsonSync("./.arkay.config.json");
  const res = (await axios.post(`${akatoshServer}/project/create`, {
    username,
    path: `${namespace}/${projectName}`
  }, {
    headers: { 'gitlab-token': gitlabToken }
  }))
  const {error, message, gitrepo} = res.data
  if (error) {
    if (JSON.parse(message).name[0].includes('has already been taken')) {
      throw new DUPLICATED_GIT_REPO_ERROR(projectName)
    } else {
      throw new Error(message)
    }
  }
  return gitrepo
}

export const validateUsername = async (username, akatoshServer, gitlabToken) => {
  const res = await axios.post(`${akatoshServer}/user/name/validate`, {
    username
  }, {headers: { 'gitlab-token': gitlabToken }})
  return res.data
}

export const publishComponent = async (componentPath, tag) => {
  const { akatoshServer, gitlabToken } = readJsonSync("./.arkay.config.json");
  try {
    return new Promise((resolve, reject) => {
      const req = http.request(`${akatoshServer}/publish/${componentPath}/release/${tag}`, {
        method: 'POST',
        headers: { 'gitlab-token': gitlabToken },
      }, function(res) {
        res.pipe(process.stdout)
        const rawData = [];
        res.on('data', chunk => {
          rawData.push(chunk);
        })
        res.on('end', () => {
          if (rawData.pop().includes(`AKATOSH ERROR`)) {
            reject({msg: "build failed"})
          } else {
            resolve()
          }
        })
      });
      req.end()
    })
  } catch (err) {
    console.error(err)
    throw new AKATOSH_SERVER_ERROR(err.response.data.message)
  }
}


export const createMergeRequest = async (options) => {
  const { akatoshServer, gitlabToken } = readJsonSync("./.arkay.config.json");
  try {
    const res = await axios.post(`${akatoshServer}/merge/request/create`, options, {
      headers: { 'gitlab-token': gitlabToken }
    })
    return res.data
  } catch (err) {
    throw new AKATOSH_SERVER_ERROR(err.response.data.message)
  }
}
