import axios from "axios";
import fsExtra from "fs-extra";
import {get} from 'http'
import { AKATOSH_SERVER_ERROR } from "./errors.js";

const { readJsonSync } = fsExtra;

export const createProject = async projectName => {
  const { akatoshServer, namespace, username } = readJsonSync("./.arkay.config.json");
  const {error, message, gitrepo}= (await axios.post(`${akatoshServer}/project/create`, {
    username,
    path: `${namespace}/${projectName}`
  })).data
  if (error) {
    throw new Error(message)
  }
  return gitrepo
}

export const validateUsername = async (username, akatoshServer) => {
  const res = await axios.post(`${akatoshServer}/user/name/validate`, {
    username
  })
  return res.data.valid
}

export const publishComponent = async (componentPath, tag) => {
  const { akatoshServer } = readJsonSync("./.arkay.config.json");
  try {
    return new Promise(resolve => {
      get(`${akatoshServer}/publish/${componentPath}/release/${tag}`, function(res) {
        res.pipe(process.stdout)
        res.on('end', () => {
          resolve()
        })
      });
    })
  } catch (err) {
    console.error(err)
    throw new AKATOSH_SERVER_ERROR(err.response.data.message)
  }
}