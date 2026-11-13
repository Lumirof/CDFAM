const AppError = require('../utils/appError');
const slugify = require('../utils/slugify');

const categoryRepository = require('../repositories/categoryNoticeRepository');

function paraId(valor) {
    const id = Number(valor);

    if (!Number.isInteger(id) || id <= 0) {
        throw new AppError('ID de categoria inválido.', 400);
    }

    return id;
}

function normalizar(entrada) {
    if (!entrada || typeof entrada !== 'object') {
        throw new AppError('Os dados da categoria devem ser enviados no corpo da requisição.', 400);
    }

    const nome = typeof entrada.nome === 'string'
        ? entrada.nome.trim()
        : '';

    const slug = typeof entrada.slug === 'string'
        ? slugify(entrada.slug)
        : slugify(nome);

    if (!nome) {
        throw new AppError('O nome da categoria é obrigatório.', 400);
    }

    if (nome.length > 80) {
        throw new AppError('O nome da categoria deve ter no máximo 80 caracteres.', 400);
    }

    if (!slug) {
        throw new AppError('O slug da categoria é obrigatório.', 400);
    }

    if (slug.length > 80) {
        throw new AppError('O slug deve ter no máximo 80 caracteres.', 400);
    }

    return { nome, slug };
}

function validar(dados) {
    const erros = [];

    if (!dados.nome) {
        erros.push('Nome da categoria é obrigatório.');
    } else if (dados.nome.length > 80) {
        erros.push('Nome deve ter no máximo 80 caracteres.');
    }

    if (!dados.slug) {
        erros.push('Não foi possível gerar o slug da categoria.');
    } else if (dados.slug.length > 80) {
        erros.push('Slug deve ter no máximo 80 caracteres.');
    }

    if (erros.length) {
        throw new AppError('Dados inválidos.', 400, erros);
    }
}

function traduzirErroDb(err) {
    if (err.code === 'ER_DUP_ENTRY') {
        return new AppError('Já existe uma categoria com esse slug.', 409);
    }

    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        return new AppError(
            'Não é possível excluir esta categoria porque existem notícias vinculadas a ela.',
            409
        );
    }

    return err;
}

async function listar() {
    return categoryRepository.listar();
}

async function buscarPorId(valor) {
    const id = paraId(valor);

    const categoria = await categoryRepository.buscarPorId(id);

    if (!categoria) {
        throw new AppError('Categoria não encontrada.', 404);
    }

    return categoria;
}

async function criar(entrada) {
    const dados = normalizar(entrada);
    validar(dados);

    try {
        const id = await categoryRepository.criar(dados);

        return await buscarPorId(id);
    } catch (err) {
        throw traduzirErroDb(err);
    }
}

async function atualizar(valor, entrada) {
    const id = paraId(valor);

    await buscarPorId(id);

    const dados = normalizar(entrada);
    validar(dados);

    try {
        await categoryRepository.atualizar(id, dados);
    } catch (err) {
        throw traduzirErroDb(err);
    }

    return buscarPorId(id);
}

async function remover(valor) {
    const id = paraId(valor);

    await buscarPorId(id);

    try {
        await categoryRepository.remover(id);
    } catch (err) {
        throw traduzirErroDb(err);
    }
}

module.exports = {
    listar,
    buscarPorId,
    criar,
    atualizar,
    remover
};