// To Do: Update the testcase

import { expect } from "chai";
import { ethers } from "hardhat";

describe("ERC20Token", function () {
  it("Should deploy the token with correct name and symbol", async function () {
    const ERC20Token = await ethers.getContractFactory("ERC20Token");
    const token = await ERC20Token.deploy("MyToken", "MTK");
    await token.deployed();

    expect(await token.name()).to.equal("MyToken");
    expect(await token.symbol()).to.equal("MTK");
  });
});