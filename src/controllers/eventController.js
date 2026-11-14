const service = require('../services/eventService');

async function listarPublicos(req, res, next) {
  try {
    res.json(await service.listarPublicos(req.query));
  } catch (err) { next(err); }
}

async function buscarPublicoPorId(req, res, next) {
  try {
    res.json(await service.buscarPublicoPorId(req.params.id));
  } catch (err) { next(err); }
}

async function listarCategorias(req, res, next) {
  try {
    res.json(await service.listarCategorias());
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
    const evento = await service.criar(req.body, req.user?.id);
    res.status(201).json(evento);
  } catch (err) { next(err); }
}

async function atualizar(req, res, next) {
  try {
    res.json(await service.atualizar(req.params.id, req.body, req.user?.id));
  } catch (err) { next(err); }
}

async function remover(req, res, next) {
  try {
    await service.remover(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
}

module.exports = {
  listarPublicos,
  buscarPublicoPorId,
  listarCategorias,
  listarAdmin,
  buscarPorId,
  criar,
  atualizar,
  remover,
};