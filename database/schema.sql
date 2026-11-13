CREATE DATABASE IF NOT EXISTS cdfam
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE cdfam;

CREATE TABLE administrador (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nome          VARCHAR(150) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  senha_hash    VARCHAR(255) NOT NULL,
  ativo         BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ultimo_login  TIMESTAMP NULL
);

CREATE TABLE categoria (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  nome  VARCHAR(80) NOT NULL,
  slug  VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE noticia (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  categoria_id   INT NOT NULL,
  titulo         VARCHAR(250) NOT NULL,
  slug           VARCHAR(250) NOT NULL UNIQUE,
  resumo         VARCHAR(400),
  conteudo       TEXT NOT NULL,
  status         ENUM('rascunho','publicada','despublicada','arquivada') NOT NULL DEFAULT 'rascunho',
  destaque       BOOLEAN NOT NULL DEFAULT FALSE,
  publicada_em   DATE NOT NULL DEFAULT (CURRENT_DATE),
  publicada_ate  DATE NULL,
  autor_id       INT NULL,
  atualizado_em  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categoria(id),
  FOREIGN KEY (autor_id)     REFERENCES administrador(id) ON DELETE SET NULL,
  CONSTRAINT ck_noticia_periodo CHECK (publicada_ate IS NULL OR publicada_ate >= publicada_em),
  INDEX idx_noticia_listagem (status, publicada_em),
  INDEX idx_noticia_destaque (status, destaque, publicada_em),
  FULLTEXT KEY ft_noticia_busca (titulo, resumo, conteudo)
);

CREATE TABLE noticia_imagem (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  noticia_id  INT NOT NULL,
  arquivo_url VARCHAR(500) NOT NULL,
  texto_alt   VARCHAR(250) NOT NULL,
  legenda     VARCHAR(250),
  ordem       INT NOT NULL,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (noticia_id) REFERENCES noticia(id) ON DELETE CASCADE,
  CONSTRAINT ck_noticia_imagem_alt CHECK (CHAR_LENGTH(TRIM(texto_alt)) > 0)
);

CREATE TABLE servico_atendimento (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  nome              VARCHAR(150) NOT NULL,
  realizado_por     VARCHAR(400),
  descricao         TEXT,
  publico_alvo      VARCHAR(150),
  `local`           VARCHAR(150),
  como_ser_atendido VARCHAR(300),
  link_titulo       VARCHAR(150),
  link_url          VARCHAR(500),
  ordem             INT NOT NULL DEFAULT 0,
  ativo             BOOLEAN NOT NULL DEFAULT TRUE,
  atualizado_em     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  atualizado_por    INT NULL,
  FOREIGN KEY (atualizado_por) REFERENCES administrador(id) ON DELETE SET NULL,
  FULLTEXT KEY ft_servico_busca (nome, descricao)
);

CREATE TABLE atividade_servico (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  servico_id        INT NOT NULL,
  nome              VARCHAR(250) NOT NULL,
  mais_informacoes  VARCHAR(300),
  ordem             INT NOT NULL DEFAULT 0,
  ativa             BOOLEAN NOT NULL DEFAULT TRUE,
  atualizado_em     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (servico_id) REFERENCES servico_atendimento(id) ON DELETE CASCADE,
  UNIQUE KEY uq_atividade_servico (id, servico_id)
);

CREATE TABLE servico_horario (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  servico_id    INT NOT NULL,
  atividade_id  INT NULL,
  dia_semana    TINYINT NOT NULL,
  hora_inicio   TIME NOT NULL,
  hora_fim      TIME NULL,
  observacao    VARCHAR(150),
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (servico_id) REFERENCES servico_atendimento(id) ON DELETE CASCADE,
  FOREIGN KEY (atividade_id, servico_id) REFERENCES atividade_servico(id, servico_id) ON DELETE CASCADE,
  CHECK (dia_semana BETWEEN 0 AND 6),
  CHECK (hora_fim IS NULL OR hora_fim > hora_inicio)
);

CREATE TABLE categoria_evento (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  nome  VARCHAR(80) NOT NULL,
  cor   VARCHAR(7)
);

CREATE TABLE evento (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  categoria_id   INT NOT NULL,
  titulo         VARCHAR(200) NOT NULL,
  descricao      TEXT,
  data_inicio    DATETIME NOT NULL,
  data_fim       DATETIME,
  dia_inteiro    BOOLEAN NOT NULL DEFAULT FALSE,
  `local`        VARCHAR(150),
  publico_alvo   VARCHAR(150),
  noticia_id     INT NULL,
  status         ENUM('rascunho','publicada','despublicada','arquivada') NOT NULL DEFAULT 'publicada',
  destaque       BOOLEAN NOT NULL DEFAULT FALSE,
  publicada_em   DATE NOT NULL DEFAULT (CURRENT_DATE),
  publicada_ate  DATE NULL,
  atualizado_em  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  atualizado_por INT NULL,
  FOREIGN KEY (categoria_id)   REFERENCES categoria_evento(id),
  FOREIGN KEY (noticia_id)     REFERENCES noticia(id)  ON DELETE SET NULL,
  FOREIGN KEY (atualizado_por) REFERENCES administrador(id)  ON DELETE SET NULL,
  CONSTRAINT ck_evento_datas   CHECK (data_fim IS NULL OR data_fim >= data_inicio),
  CONSTRAINT ck_evento_periodo CHECK (publicada_ate IS NULL OR publicada_ate >= publicada_em),
  INDEX idx_evento_data (data_inicio),
  INDEX idx_evento_publico (status, publicada_em, data_inicio),
  FULLTEXT KEY ft_evento_busca (titulo, descricao)
);

CREATE TABLE horario_funcionamento (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  dia_semana     TINYINT NOT NULL,
  hora_inicio    TIME NOT NULL,
  hora_fim       TIME NOT NULL,
  observacao     VARCHAR(150),
  ativo          BOOLEAN NOT NULL DEFAULT TRUE,
  atualizado_em  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  atualizado_por INT NULL,
  FOREIGN KEY (atualizado_por) REFERENCES administrador(id) ON DELETE SET NULL,
  UNIQUE KEY uq_horario_funcionamento (dia_semana, hora_inicio),
  CHECK (dia_semana BETWEEN 0 AND 6),
  CHECK (hora_fim > hora_inicio)
);

CREATE TABLE bloqueio_agenda (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  servico_id     INT NULL,
  tipo           ENUM('feriado','manutencao','outro') NOT NULL DEFAULT 'outro',
  data_inicio    DATE NOT NULL,
  data_fim       DATE NULL,
  hora_inicio    TIME NULL,
  hora_fim       TIME NULL,
  motivo         VARCHAR(200),
  atualizado_em  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  atualizado_por INT NULL,
  FOREIGN KEY (servico_id)     REFERENCES servico_atendimento(id) ON DELETE CASCADE,
  FOREIGN KEY (atualizado_por) REFERENCES administrador(id) ON DELETE SET NULL,
  CHECK (data_fim IS NULL OR data_fim >= data_inicio),
  CHECK ((hora_inicio IS NULL) = (hora_fim IS NULL)),
  CHECK (hora_fim IS NULL OR hora_fim > hora_inicio),
  INDEX idx_bloqueio_data (data_inicio, data_fim)
);

CREATE TABLE mapa_agendamento (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  titulo         VARCHAR(200) NOT NULL,
  url            VARCHAR(500) NOT NULL,
  periodo        VARCHAR(50),
  vigente        BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_por INT NULL,
  vigente_unico  TINYINT GENERATED ALWAYS AS (IF(vigente, 1, NULL)) STORED,
  UNIQUE KEY uq_mapa_vigente (vigente_unico),
  FOREIGN KEY (atualizado_por) REFERENCES administrador(id) ON DELETE SET NULL
);

CREATE TABLE atividade_estagio (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  modalidade  ENUM('pratica_assistida','estagio_internato','residencia') NOT NULL,
  origem      VARCHAR(200) NOT NULL,
  nome        VARCHAR(250) NOT NULL,
  ordem       INT NOT NULL DEFAULT 0,
  ativa       BOOLEAN NOT NULL DEFAULT TRUE,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  atualizado_por INT NULL,
  FOREIGN KEY (atualizado_por) REFERENCES administrador(id) ON DELETE SET NULL,
  FULLTEXT KEY ft_atividade_estagio_busca (nome, origem)
);

CREATE TABLE acao_extensao (
  id                      INT AUTO_INCREMENT PRIMARY KEY,
  sigla                   VARCHAR(30),
  nome                    VARCHAR(250) NOT NULL,
  codigo_prex             VARCHAR(30),
  ano_referencia          SMALLINT NOT NULL,
  coordenador_nome        VARCHAR(150) NOT NULL,
  coordenador_lotacao     VARCHAR(50),
  publico_alvo            VARCHAR(400),
  atividades              TEXT,
  como_buscar_atendimento VARCHAR(500),
  local_atendimento       VARCHAR(300),
  instagram_url           VARCHAR(300),
  ordem                   INT NOT NULL DEFAULT 0,
  ativa                   BOOLEAN NOT NULL DEFAULT TRUE,
  atualizado_em           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  atualizado_por          INT NULL,
  FOREIGN KEY (atualizado_por) REFERENCES administrador(id) ON DELETE SET NULL,
  CONSTRAINT ck_acao_coordenador CHECK (CHAR_LENGTH(TRIM(coordenador_nome)) > 0),
  FULLTEXT KEY ft_acao_busca (nome, atividades)
);

CREATE TABLE acao_extensao_turno (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  acao_id     INT NOT NULL,
  dia_semana  TINYINT NOT NULL,
  turno       ENUM('manha','tarde') NOT NULL,
  observacao  VARCHAR(150),
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (acao_id) REFERENCES acao_extensao(id) ON DELETE CASCADE,
  UNIQUE (acao_id, dia_semana, turno),
  CHECK (dia_semana BETWEEN 0 AND 6)
);