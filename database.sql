-- =============================================================
-- 📄 ARQUIVO: database.sql  (raiz do projeto)
-- =============================================================
-- Execute este script no MySQL Workbench ou via terminal para
-- criar o banco de dados e a tabela necessários para a API.
--
-- Terminal: mysql -u root -p < database.sql
-- =============================================================

CREATE DATABASE IF NOT EXISTS estoque_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE estoque_db;

CREATE TABLE IF NOT EXISTS produtos (
  id         INT            NOT NULL AUTO_INCREMENT,
  nome       VARCHAR(150)   NOT NULL,
  preco      DECIMAL(10, 2) NOT NULL,
  quantidade INT            NOT NULL DEFAULT 0,
  criado_em  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- Dados de exemplo para testes
INSERT INTO produtos (nome, preco, quantidade) VALUES
  ('Parafuso M6 Sextavado', 0.50, 5000),
  ('Porca M6',              0.30, 4000),
  ('Arruela Lisa M6',       0.10, 8000),
  ('Chave Allen 5mm',      12.90,  150);