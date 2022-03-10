import { rejects } from "assert";
import axios from "axios";
import fsExtra from "fs-extra";
import {get} from 'http'
import { AKATOSH_SERVER_ERROR, DUPLICATED_GIT_REPO_ERROR } from "./errors.js";

const { readJsonSync } = fsExtra;

export const createProject = async projectName => {
  const { akatoshServer, namespace, username } = readJsonSync("./.arkay.config.json");
  const res = (await axios.post(`${akatoshServer}/project/create`, {
    username,
    path: `${namespace}/${projectName}`
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

export const validateUsername = async (username, akatoshServer) => {
  const res = await axios.post(`${akatoshServer}/user/name/validate`, {
    username
  })
  return res.data
}

export const publishComponent = async (componentPath, tag) => {
  const { akatoshServer } = readJsonSync("./.arkay.config.json");
  try {
    return new Promise((resolve, reject) => {
      get(`${akatoshServer}/publish/${componentPath}/release/${tag}`, function(res) {
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
    })
  } catch (err) {
    console.error(err)
    throw new AKATOSH_SERVER_ERROR(err.response.data.message)
  }
}


export const createMergeRequest = async (options) => {
  const { akatoshServer } = readJsonSync("./.arkay.config.json");
  try {
    const res = await axios.post(`${akatoshServer}/merge/request/create`, options)
    return res.data
  } catch (err) {
    throw new AKATOSH_SERVER_ERROR(err.response.data.message)
  }
}
