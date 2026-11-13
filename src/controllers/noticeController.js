const service = require('../services/noticeService');

async function listarPublicas(req, res, next) {
  try {
    res.json(await service.listarPublicas(req.query));
  } catch (err) { next(err); }
}

async function buscarPorSlug(req, res, next) {
  try {
    res.json(await service.buscarPublicaPorSlug(req.params.slug));
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
    const noticia = await service.criar(req.body, req.user?.id);
    res.status(201).json(noticia);
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
  listarPublicas,
  buscarPorSlug,
  listarAdmin,
  buscarPorId,
  criar,
  atualizar,
  remover,
};