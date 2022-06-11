import Router from 'koa-router'
import { ethers } from 'ethers'
import { getJsonByAddress, getUserInfo } from '../db/index.js'

import EmissionABI from '../abi/MetaForestCarbonEmission.js'
import EnergyABI from '../abi/MetaForestCarbonEnergy.js'
import TreeABI from '../abi/MetaForestCore.js'

import Mock from 'mockjs'
import Decimal from 'decimal.js'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
dayjs.extend(customParseFormat)

// const infuraProvider = new ethers.providers.InfuraProvider('rinkeby')
const infuraProvider = new ethers.providers.JsonRpcProvider(process.env.JSON_RPC)
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, infuraProvider)
const router = Router({
  prefix: '/api',
}) //Prefixed all routes with /movies

router.post('/login', handleLogin)
router.post('/carbon/credit', updateCredit)
router.get('/carbon/credits/:address', getCredits)
router.get('/carbon/credits/:address/:yyyymm', getCredits)
router.post('/carbon/token/burn', updateBurnToken)

async function updateCredit(ctx) {
  try {
    const { value, type, address } = ctx.request.body
    let credit = 0
    if (value <= 0 || !address || (type !== 1 && type !== 2)) {
      ctx.body = {
        code: -3,
        msg: 'Parameter error',
        data: null,
      }
      return
    }
    if (type === 1) {
      // walk
      const oneKm = new Decimal(200)
      credit = oneKm.mul(value)
      await updateCredit2Database(address, {
        reduction: credit,
        kilometer: value,
      })
    } else if (type === 2) {
      // tree
      if (!Number.isInteger(value)) {
        ctx.body = {
          code: -3,
          msg: 'Parameter error',
          data: null,
        }
        return
      }
      const oneTreeCredit = 78500
      credit = oneTreeCredit * value
      await updateCredit2Database(address, {
        reduction: credit,
      })
    }
    if (+credit) {
      const { txHash } = await updateCredit2Chain(address, +credit)
      ctx.body = {
        code: 200,
        msg: 'ok',
        data: {
          credit: +credit,
          txHash: txHash,
        },
      }
    } else {
      ctx.body = {
        code: -4,
        msg: 'value is zero',
        data: null,
      }
    }
  } catch (error) {
    console.log('🚀 ~ file: forest.js ~ line 63 ~ updateCredit ~ error', error.message)
    ctx.body = {
      code: -1,
      msg: 'Server exception',
      data: null,
    }
  }
}

async function getCredits(ctx) {
  try {
    const address = ctx.params.address
    if (address) {
      const { data } = await getJsonByAddress(address)
      let key = dayjs().format('YYYYMM')
      const yyyymm = ctx.params.yyyymm
      if (yyyymm) key = yyyymm
      let resData = data[key] || []
      ctx.body = {
        code: 200,
        msg: 'ok',
        data: resData,
      }
    } else {
      ctx.body = {
        code: -2,
        msg: 'Address cannot be empty',
        data: null,
      }
    }
  } catch (error) {
    console.log('🚀 ~ file: forest.js ~ line 89 ~ getCredits ~ error', error.message)
    ctx.body = {
      code: -1,
      msg: 'Server exception',
      data: null,
    }
  }
}

async function updateBurnToken(ctx) {
  try {
    const { value, address, tokenId } = ctx.request.body
    if (!address || !Number.isInteger(value)) {
      ctx.body = {
        code: -3,
        msg: 'Parameter error',
        data: null,
      }
      return
    }

    if (!(Number.isInteger(tokenId) && tokenId >= 0)) {
      ctx.body = {
        code: -4,
        msg: 'Incorrect TokenId',
        data: null,
      }
      return
    }

    const { txHash } = await updateBurn2Chain(address, tokenId, value)

    await updateBurn2Database(address, value)

    ctx.body = {
      code: 200,
      msg: 'ok',
      data: {
        txHash,
      },
    }
  } catch (error) {
    console.log('🚀 ~ file: forest.js ~ line 115 ~ updateBurnToken ~ error', error)
    ctx.body = {
      code: -1,
      msg: 'Server exception',
      data: null,
    }
  }
}

async function handleLogin(ctx) {
  try {
    const { address } = ctx.request.body
    if (address) {
      const db = await getUserInfo()
      if (db.data && db.data[address]) {
        const currentData = db.data[address]
        const isAfter = dayjs().isAfter(currentData.updateTime, 'day')
        if (isAfter) {
          console.log('🚀 ~ file: forest.js ~ line 149 ~ handleLogin ~ isAfter', isAfter)
          const mockEmission = randomEmission()
          updateEmission2Chain(address, +mockEmission.increase)
          const yesterdayData = getYesterdayData(address)
          const { lastBalanceOf, totalBalanceOf } = await queryEmission4Chain(address)

          db.data[address] = {
            latestEmission: lastBalanceOf,
            totalEmission: totalBalanceOf,
            latestBurnToken: yesterdayData.burnToken || 0,
            updateTime: Date.now(),
          }
          await db.write()

          await updateEmission2Database(address, {
            increase: mockEmission.increase,
            txAmount: mockEmission.txAmount,
            onChain: true,
          })

          ctx.body = {
            code: 200,
            msg: 'ok',
            data: {
              latestEmission: lastBalanceOf,
              totalEmission: totalBalanceOf,
              latestBurnToken: yesterdayData.burnToken || 0,
              updateTime: Date.now(),
            },
          }
        } else {
          ctx.body = {
            code: 200,
            msg: 'ok',
            data: db.data[address],
          }
        }
      } else {
        await mockUserCredits(address)
        const mockEmission = randomEmission()
        const latestBurnToken = 10 * Mock.Random.natural(10, 100)
        db.data = db.data || {}
        db.data[address] = {
          latestEmission: +mockEmission.increase,
          totalEmission: +mockEmission.increase,
          latestBurnToken,
          updateTime: Date.now(),
        }
        await db.write()

        await updateEmission2Database(address, {
          increase: mockEmission.increase,
          txAmount: mockEmission.txAmount,
          burnToken: latestBurnToken,
          onChain: true,
        })

        updateEmission2Chain(address, +mockEmission.increase).catch((err) => {
          console.log('🚀 ~ file: forest.js ~ line 221 ~ handleLogin ~ err', err.reason)
        })

        ctx.body = {
          code: 200,
          msg: 'ok',
          data: {
            latestEmission: +mockEmission.increase,
            totalEmission: +mockEmission.increase,
            latestBurnToken,
            updateTime: Date.now(),
          },
        }
      }
    } else {
      ctx.body = {
        code: -2,
        msg: 'Address cannot be empty',
        data: null,
      }
    }
  } catch (error) {
    console.log('🚀 ~ file: forest.js ~ line 143 ~ handleLogin ~ error', error.message)
    ctx.body = {
      code: -1,
      msg: 'Server exception',
      data: null,
    }
  }
}

async function mockUserCredits(address) {
  const db = await getJsonByAddress(address)
  if (!db.data) {
    db.data = createUserMockCredits()

    await db.write()
  }
}

function createUserMockCredits() {
  const may = 31
  const june = 30
  const obj = { 202205: [], 202206: [] }

  obj[202205] = loopCreate(may, '2022-05-')
  obj[202206] = loopCreate(june, '2022-06-')

  return obj
}

function loopCreate(length, timeString) {
  const arr = []
  const defaultData = {
    increase: 0,
    txAmount: 0,
    reduction: 0,
    kilometer: 0,
    isOffset: true,
    burnToken: 0,
    onChain: false,
  }
  for (let index = 0; index < length; index++) {
    arr.push({
      timestamp: dayjs(`${timeString}${index + 1}`, 'YYYY-MM-D').valueOf(),
      ...defaultData,
    })
  }
  return arr
}

function randomEmission() {
  const oneTx = new Decimal(8)
  const oneKm = new Decimal(200)
  let txAmount = 0
  let kilometer = 0
  const isEmission = Math.random() >= 0.1
  if (isEmission) {
    txAmount = Mock.Random.natural(5, 20)
  }
  const isWalk = Math.random() >= 0.1
  if (isWalk) {
    kilometer = Mock.Random.float(0, 5, 1, 1)
  }

  return {
    increase: oneTx.mul(txAmount),
    reduction: oneKm.mul(kilometer),
    txAmount,
    kilometer,
    isOffset: isWalk,
  }
}

async function updateCredit2Chain(address, credit) {
  console.log('Enter updateCredit2Chain')
  console.log('credit', credit)
  // init contract
  const contract = new ethers.Contract(process.env.ENERGY_ADDRESS, EnergyABI.abi, signer)
  // update user's
  const tx = await contract.mint(address, credit, {
    gasLimit: 900000,
  })
  console.log('this tx hash', tx.hash)
  console.log('user address', address)
  // await tx.wait() // mock --- avoid blocking
  console.log('updateCredit2Chain ok')
  return {
    txHash: tx.hash,
  }
}

async function updateEmission2Chain(address, emissionValue) {
  console.log('Enter updateEmission2Chain')
  console.log('emissionValue', emissionValue)
  // init contract
  const contract = new ethers.Contract(process.env.EMISSION_ADDRESS, EmissionABI.abi, signer)
  // update user's
  const tx = await contract.increaseCarbonEmissions(address, emissionValue, {
    gasLimit: 900000,
  })
  // await tx.wait()  // mock --- avoid blocking
  console.log('updateEmission2Chain ok')
  return {
    txHash: tx.hash,
  }
}

async function updateBurn2Chain(address, tokenId, amount) {
  console.log('Enter updateBurn2Chain')
  console.log('address', address)
  console.log('tokenId', tokenId)
  console.log('amount', amount)
  const contract = new ethers.Contract(process.env.CORE_ADDRESS, TreeABI.abi, signer)

  const tx = await contract.watering(address, tokenId, amount, {
    gasLimit: 900000,
  })

  // await tx.wait() // mock --- avoid blocking
  console.log('updateBurn2Chain ok')
  return {
    txHash: tx.hash,
  }
}

async function updateCredit2Database(address, newData) {
  console.log('updateCredit2Database', newData)
  const key = dayjs().format('YYYYMM')
  const db = await getJsonByAddress(address)
  if (db.data && db.data[key]) {
    const { reduction, kilometer = 0 } = newData
    const index = dayjs().date() - 1
    const currentData = db.data[key][index]
    db.data[key][index] = Object.assign(
      currentData,
      newData,
      {
        isOffset: new Decimal(reduction).gte(currentData.increase),
      },
      {
        reduction: new Decimal(currentData.increase).add(reduction),
        kilometer: new Decimal(currentData.kilometer).add(kilometer),
      }
    )
    await db.write()
  }
}

async function updateEmission2Database(address, newData) {
  console.log('🚀 ~ file: forest.js ~ line 355 ~ updateEmission2Database ~ address', address)
  console.log('🚀 ~ file: forest.js ~ line 355 ~ updateEmission2Database ~ newData', newData)

  let index = dayjs().date() - 1 // today
  // let index = dayjs().date() - 2 // yesterday
  let key = dayjs().format('YYYYMM')
  if (index < 0) {
    key = dayjs().subtract(1, 'day').format('YYYYMM')
    index = dayjs().subtract(1, 'day').endOf('month').date() - 1
  }

  const db = await getJsonByAddress(address)
  if (db.data && db.data[key]) {
    const { increase } = newData

    const currentData = db.data[key][index]
    db.data[key][index] = Object.assign(currentData, newData, {
      isOffset: new Decimal(currentData.reduction).gte(increase),
    })
    await db.write()
  }
}

async function updateBurn2Database(address, value) {
  const key = dayjs().format('YYYYMM')
  const db = await getJsonByAddress(address)
  if (db.data && db.data[key]) {
    const index = dayjs().date() - 1
    const currentData = db.data[key][index]
    db.data[key][index] = Object.assign(currentData, {
      burnToken: new Decimal(currentData.burnToken).add(value),
    })
    await db.write()
  }
}

async function getYesterdayData(address) {
  let index = dayjs().date() - 1 // today
  // let index = dayjs().date() - 2 // yesterday
  let key = dayjs().format('YYYYMM')
  if (index < 0) {
    key = dayjs().subtract(1, 'day').format('YYYYMM')
    index = dayjs().subtract(1, 'day').endOf('month').date() - 1
  }
  const db = await getJsonByAddress(address)
  if (db.data && db.data[key]) {
    return db.data[key][index]
  }
  return {}
}

async function queryEmission4Chain(address) {
  // init contract
  const contract = new ethers.Contract(process.env.EMISSION_ADDRESS, EmissionABI.abi, infuraProvider)
  // update user's
  const lastBalanceOf = await contract.lastBalanceOf(address)
  const totalBalanceOf = await contract.totalBalanceOf(address)

  return {
    lastBalanceOf: lastBalanceOf.toNumber(),
    totalBalanceOf: totalBalanceOf.toNumber(),
  }
}

export default router
