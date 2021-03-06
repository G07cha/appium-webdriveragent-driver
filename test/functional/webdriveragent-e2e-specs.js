import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { createDevice, deleteDevice } from 'node-simctl';
import { getSimulator } from 'appium-ios-simulator';
import request from 'request-promise';
import WebDriverAgent from '../../lib/webDriverAgent.js';

chai.should();
chai.use(chaiAsPromised);

const PLATFORM_VERSION = '9.0';
let testUrl = 'http://localhost:8100/tree';

describe('WebDriverAgentDriver', () => {
  describe('with fresh sim', () => {
    let sim;
    before(async function () {
      this.timeout(30 * 1000);
      let simUdid = await createDevice('webDriverAgentTest', 'iPhone 6', PLATFORM_VERSION);
      sim = await getSimulator(simUdid);
    });

    after(async function () {
      this.timeout(20 * 1000);
      await deleteDevice(sim.udid);
    });

    describe('with running sim', () => {
      afterEach(async function () {
        this.timeout(30 * 1000);
        await sim.shutdown();
      });

      it('should launch agent on a sim', async function () {
        this.timeout(90 * 1000);
        await sim.run();
        let agent = new WebDriverAgent({
          udid: sim.udid,
          platformVersion: PLATFORM_VERSION,
          host: 'localhost',
          port: 8100,
          agentPath: process.env.AGENT_PATH
        });

        await agent.launch('sessionId');
        await request(testUrl);
      });
    });

    describe('with sim not booted', () => {
      it('should exit if sim is not booted', async function () {
        this.timeout(20 * 1000);
        let agent = new WebDriverAgent({
          udid: sim.udid,
          platformVersion: PLATFORM_VERSION,
          host: 'localhost',
          port: 8100,
          agentPath: process.env.AGENT_PATH
        });

        await agent.launch('sessionId').should.be.rejectedWith('is not in \'booted\'');
      });
    });
  });
});
