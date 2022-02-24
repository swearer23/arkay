import axios from "axios";
import fsExtra from "fs-extra";

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