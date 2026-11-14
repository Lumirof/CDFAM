const service = require('../services/eventCategoryService');

async function listar(req, res, next) {
  try {
    res.json(await service.listar(req.query));
  } catch (err) { next(err); }
}

async function buscarPorId(req, res, next) {
  try {
    res.json(await service.buscarPorId(req.params.id));
  } catch (err) { next(err); }
}

async function criar(req, res, next) {
  try {
    res.status(201).json(await service.criar(req.body));
  } catch (err) { next(err); }
}

async function atualizar(req, res, next) {
  try {
    res.json(await service.atualizar(req.params.id, req.body));
  } catch (err) { next(err); }
}

async function remover(req, res, next) {
  try {
    await service.remover(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover,
};