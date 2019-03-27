import { describe } from 'mocha';
import { expect } from 'chai';

import { SkillServer } from "../src/SkillServer";

describe('AwesomeLibrary', () => {

  it('should create an instance', () => {
    const value = new SkillServer(1);
    expect(value).to.be.instanceOf(SkillServer);
  });

});
