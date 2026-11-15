const service = require('../services/extensionService');

async function listarPublicas(req, res, next) {
  try {
    res.json(await service.listarPublicas(req.query));
  } catch (err) { next(err); }
}

async function listarAdmin(req, res, next) {
  try {
    res.json(await service.listarAdmin(req.query));
  } catch (err) { next(err); }
}

async function buscarPorId(req, res, next) {
  try {
    res.json(await service.buscarPorId(req.params.id));
  } catch (err) { next(err); }
}

async function criar(req, res, next) {
  try {
    res.status(201).json(await service.criar(req.body, req.user?.id));
  } catch (err) { next(err); }
}

async function atualizar(req, res, next) {
  try {
    res.json(await service.atualizar(req.params.id, req.body, req.user?.id));
  } catch (err) { next(err); }
}

async function definirAtiva(req, res, next) {
  try {
    res.json(await service.definirAtiva(req.params.id, req.body, req.user?.id));
  } catch (err) { next(err); }
}

async function remover(req, res, next) {
  try {
    await service.remover(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = {
  listarPublicas,
  listarAdmin,
  buscarPorId,
  criar,
  atualizar,
  definirAtiva,
  remover,
};