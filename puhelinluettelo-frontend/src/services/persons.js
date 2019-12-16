import axios from 'axios';
const baseUrl = '/api/persons';

const getAll = () => {
  return axios.get(baseUrl);
};

const create = person => {
  return axios.post(baseUrl, person);
};

const delete_ = person => {
  return axios.delete(`${baseUrl}/${person.id}`);
};

const update = person => {
  return axios.put(`${baseUrl}/${person.id}`, person);
};

export default {getAll, create, delete_, update};
