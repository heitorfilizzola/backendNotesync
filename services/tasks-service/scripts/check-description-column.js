/**
 * Script para verificar e adicionar a coluna description na tabela Tarefas
 * Execute este script manualmente se a migração automática não funcionar
 * 
 * Uso:
 *   node scripts/check-description-column.js
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

async function checkAndAddDescriptionColumn() {
  try {
    console.log('🔍 Conectando ao banco de dados...');
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados!');
    
    const tableName = 'Tarefas';
    const queryInterface = sequelize.getQueryInterface();
    
    // Verificar se a tabela existe
    console.log(`\n📋 Verificando se a tabela "${tableName}" existe...`);
    const [tableCheck] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = '${tableName}' 
      LIMIT 1;
    `);
    
    if (!tableCheck || tableCheck.length === 0) {
      console.log(`❌ Tabela "${tableName}" não existe!`);
      console.log('   Execute o sync do Sequelize primeiro para criar a tabela.');
      process.exit(1);
    }
    
    console.log(`✅ Tabela "${tableName}" existe!`);
    
    // Verificar se a coluna description existe
    console.log(`\n🔍 Verificando se a coluna "description" existe...`);
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      AND table_name = '${tableName}' 
      AND column_name = 'description'
      LIMIT 1;
    `);
    
    if (columns && columns.length > 0) {
      const col = columns[0];
      console.log(`✅ Coluna "description" já existe!`);
      console.log(`   Tipo: ${col.data_type}`);
      console.log(`   Nullable: ${col.is_nullable}`);
    } else {
      console.log(`❌ Coluna "description" NÃO existe!`);
      console.log(`\n📝 Adicionando coluna "description"...`);
      
      try {
        await queryInterface.addColumn(tableName, 'description', {
          type: DataTypes.TEXT,
          allowNull: true,
        });
        console.log(`✅ Coluna "description" adicionada com sucesso!`);
      } catch (error) {
        console.error(`❌ Erro ao adicionar coluna:`, error.message);
        
        // Tentar com SQL direto
        console.log(`\n🔄 Tentando adicionar via SQL direto...`);
        try {
          await sequelize.query(`
            ALTER TABLE "${tableName}" 
            ADD COLUMN IF NOT EXISTS "description" TEXT;
          `);
          console.log(`✅ Coluna adicionada via SQL direto!`);
        } catch (sqlError) {
          console.error(`❌ Erro ao adicionar via SQL:`, sqlError.message);
          throw sqlError;
        }
      }
    }
    
    // Mostrar estrutura completa da tabela
    console.log(`\n📊 Estrutura completa da tabela "${tableName}":`);
    const [allColumns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      AND table_name = '${tableName}' 
      ORDER BY ordinal_position;
    `);
    
    console.table(allColumns);
    
    console.log('\n✅ Verificação concluída!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

checkAndAddDescriptionColumn();

