import createContext from '../context/createContext'
import newVariable from './newVariable'

describe('#newVariable()', () => {
  it('should resolve as string when coherced', () => {
    const variableString = '${foo}'
    const data = {
      foo: 123
    }
    const variable = newVariable(variableString, data)
    expect('abc' + variable).toBe('abc123')
  })

  it('should retrieve all instance ids from property path of variable', async () => {
    const context = await createContext(
      {},
      {
        app: {
          id: 'test'
        }
      }
    )
    const Component = await context.loadType('Component')
    const component = await context.construct(Component, {})
    const compA = await context.construct(Component, {})
    const compB = await context.construct(Component, {})
    component.foo = {
      compA
    }
    compA.bar = {
      compB
    }
    const variableString = '${this.foo.compA.bar.compB.dne}'
    const data = {
      this: component
    }
    const variable = newVariable(variableString, data)
    expect(variable.findInstanceIds()).toEqual([
      component.instanceId,
      compA.instanceId,
      compB.instanceId
    ])
  })

  it('walks a path that includes variables in the path', async () => {
    const context = await createContext(
      {},
      {
        app: {
          id: 'test'
        }
      }
    )
    const Component = await context.loadType('Component')
    const compA = await context.construct(Component, {})
    const compB = await context.construct(Component, {})
    const compC = await context.construct(Component, {})
    const data = {
      compA,
      compB,
      compC
    }
    compA.foo = newVariable('${compB}', data)
    compB.bar = newVariable('${compC}', data)
    const variable = newVariable('${compA.foo.bar}', data)
    expect(variable.findInstanceIds()).toEqual([
      compA.instanceId,
      compB.instanceId,
      compC.instanceId
    ])
  })
})