import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { AgentsInquiry, LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { Member, Members } from '../../libs/dto/member/member';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UseGuards } from '@nestjs/common';
import { AuthMember } from '../auth/decoratots/authMember.decorator';
import { ObjectId } from 'mongoose';
import { Roles } from '../auth/decoratots/roles.decorator';

import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { WithoutGuard } from '../auth/guards/without.guard';

@Resolver()
export class MemberResolver {
	constructor(private readonly memberService: MemberService) {}

	@Mutation(() => Member)
	public async signup(@Args('input') input: MemberInput): Promise<Member> {
		console.log('Mutation signup');
		console.log('input', input);
		return this.memberService.signup(input);
	}

	@Mutation(() => Member)
	public async login(@Args('input') input: LoginInput): Promise<Member> {
		console.log('Mutation login');
		return this.memberService.login(input);
	}
  //Authenticated

	@UseGuards(AuthGuard)
	@Mutation(() => Member)
	public async updateMember(
		@Args("input") input : MemberUpdate,
		@AuthMember() memberId: ObjectId): Promise<Member> {
		console.log('Mutation updateMember');
		delete input._id;
		return this.memberService.updateMember(memberId, input);
	}


	@UseGuards(WithoutGuard)
	@Query(() => Member)
	public async getMember(@Args("memberId")input :string, @AuthMember('_id') memberId: ObjectId): Promise<Member> {
		console.log('Query getMember');
		const targetId = shapeIntoMongoObjectId(input);
		return this.memberService.getMember(memberId, targetId);
	}


	@UseGuards(WithoutGuard)
	@Query(() => Members)
	public async getAgents(@Args('input') input: AgentsInquiry, @AuthMember('_id') memberId: ObjectId): Promise<Members> {
		console.log("Query: getAgents");
		return this.memberService.getAgents(memberId, input);
	}
  /**ADMIN */
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
  @Mutation(() => String)
  public async getAllMembersByAdmin():Promise<string> {
		return this.memberService.getAllMembersByAdmin();
  }



	@Mutation(() => String)
	public async updateMemberByAdmin(): Promise<string> {
		console.log('Mutation updateMemberByAdmin');
		return this.memberService.updateMemberByAdmin();
	}
}