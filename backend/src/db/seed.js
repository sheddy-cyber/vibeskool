import 'dotenv/config';
import fs from 'fs';
import path from 'path'
import { fileURLToPath } from 'url'
import { query } from './pool.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

import { createRequire } from 'module';

async function seed() {
  console.log('🌱 Starting database seed...')

  try {
    // 1. Read data from seed_data.cjs
    const require = createRequire(import.meta.url);
    const { PATHS, LESSONS_CONTENT } = require('./seed_data.cjs');

    console.log(`Loaded ${PATHS.length} paths and ${Object.keys(LESSONS_CONTENT).length} lessons from seed_data.cjs.`)

    // 3. Clear existing content (due to cascade, this is safe to do repeatedly)
    console.log('Clearing old skill_paths and lessons...')
    await query('DELETE FROM skill_paths')

    // 4. Insert Paths
    let pathOrder = 0;
    for (const p of PATHS) {
      console.log(`Inserting path: ${p.id}`)
      await query(`
        INSERT INTO skill_paths (id, title, description, icon, color, tag, modules_json, order_index, is_default)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [p.id, p.name, p.description, p.icon, p.color, p.tag, JSON.stringify(p.modules || []), pathOrder++, p.id === 'full-stack-web'])

      // Insert Lessons for this path
      let lessonOrder = 0;
      if (p.lessons_data) {
        for (const summary of p.lessons_data) {
          const fullLesson = LESSONS_CONTENT[summary.id]
          if (!fullLesson) {
             console.warn(`Warning: No full content found for lesson ${summary.id}`)
             continue;
          }

          await query(`
            INSERT INTO lessons (id, path_id, title, duration, part_name, mek_label, content_json, ai_prompt, terminal_mission, order_index, published)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
          `, [
            summary.id,
            p.id,
            fullLesson.title,
            fullLesson.duration,
            summary.part,
            fullLesson.mekLabel,
            JSON.stringify(fullLesson.sections || []),
            fullLesson.aiPrompt || null,
            fullLesson.terminalMission || null,
            lessonOrder++
          ])
        }
      }
    }

    console.log('✅ Seeding complete!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

seed()
