/* eslint-env mocha */

const fs = require('fs')
const path = require('path')
const assert = require('assert')

// counts the number of recipes with a shape, without one and with an outShape

function getIfExist (path) {
  if (fs.existsSync(path)) {
    return require(path)
  } else {
    return null
  }
}

require('./version_iterator')(function (p, versionString) {
  describe('audit recipes ' + versionString, function () {
    it('audit recipes', function () {
      let recipes
      const pFile = path.join(p, 'recipes.json')
      if (fs.existsSync(pFile)) {
        recipes = require(pFile)
      } else {
        console.log('No recipes for version ' + versionString)
      }
      if (recipes) {
        let shapeCount = 0
        let shapelessCount = 0
        let outShapeCount = 0
        Object.keys(recipes).forEach(key => {
          const list = recipes[key]
          for (let i = 0; i < list.length; ++i) {
            const recipe = list[i]
            if (recipe.inShape != null) {
              shapeCount += 1
            } else if (recipe.ingredients != null) {
              shapelessCount += 1
            } else {
              console.log('inShape or ingredients required:', key)
            }
            if (recipe.outShape) outShapeCount += 1
          }
        })

        console.log('normal recipes:', shapeCount)
        console.log('shapeless recipes:', shapelessCount)
        console.log('how many have an outShape:', outShapeCount)
      }
    })
    it('pickaxe not upside-down', () => {
      const recipes = getIfExist(path.join(p, 'recipes.json'))
      const items = getIfExist(path.join(p, 'items.json'))
      if (recipes && items) {
        const pickaxe = items.find(x => x.name === 'diamond_pickaxe')
        const stick = items.find(x => x.name === 'stick')
        const diamond = items.find(x => x.name === 'diamond')

        const recipe = recipes[pickaxe.id]

        // Uncomment to fix upside-down recipes
        /* if (recipe[0].inShape[0][0] !== diamond.id) {
          for (const item of Object.values(recipes)) {
            for (const rep of item) {
              if (rep.inShape) rep.inShape.reverse()
            }
          }
          fs.writeFileSync(path.join(p, 'recipes.json'), JSON.stringify(recipes, null, 2))
        } */

        // Those 2 versions doesnt contain diamond pickaxe recipe, to be fixed...
        if (versionString === 'pc 1.9' || versionString === 'pc 1.10' || !recipe[0]) return

        assert.deepStrictEqual(recipe[0].inShape, [
          [
            diamond.id,
            diamond.id,
            diamond.id
          ],
          [
            null,
            stick.id,
            null
          ],
          [
            null,
            stick.id,
            null
          ]
        ])
      }
    })
    it('iron door not rotated', () => {
      const recipes = getIfExist(path.join(p, 'recipes.json'))
      const items = getIfExist(path.join(p, 'items.json'))
      if (recipes && items) {
        const ironDoor = items.find(x => x.name === 'iron_door')
        const iron = items.find(x => x.name === 'iron_ingot')

        const recipe = recipes[ironDoor.id]

        if (!recipe[0]) return

        assert.deepStrictEqual(recipe[0].inShape, [
          [
            iron.id,
            iron.id
          ],
          [
            iron.id,
            iron.id
          ],
          [
            iron.id,
            iron.id
          ]
        ])
      }
    })
    it('crafting benches has multiple recipes', () => {
      const recipes = getIfExist(path.join(p, 'recipes.json'))
      const items = getIfExist(path.join(p, 'items.json'))
      if (recipes && items) {
        const craftingTable = items.find(x => x.name === 'crafting_table')
        const oakPlanks = items.find(x => x.name === 'oak_planks')
        if (!oakPlanks) return // Bail if version doesn't have seperately defined planks, this prevents the test failing on versions that use metadata
        const recipe = recipes[craftingTable.id]
        if (!recipe[0]) return
        // remove the if after fixing https://github.com/PrismarineJS/minecraft-data/issues/917
        if (versionString !== 'pc 1.20.5' && versionString !== 'pc 1.20.6') {
          assert.notEqual(recipe.length, 1) // Check that crafting table has multiple recipes.
        }
      }
    })
  })
})
