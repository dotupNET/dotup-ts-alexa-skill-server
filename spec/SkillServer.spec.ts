import { SkillServer } from "../src/SkillServer";

describe('AwesomeLibrary',()=>{

  it('should create an instance', () => {
    const value = new SkillServer(1);
    expect(value).toBeTruthy();
  });

});
