import { IsString, IsOptional, IsNumber, IsObject, IsEnum } from 'class-validator';

export enum NodeType {
  IDEA = 'idea',
  PROBLEM = 'problem',
  SOLUTION = 'solution',
  TARGET_USERS = 'target_users',
  MARKET_RESEARCH = 'market_research',
  COMPETITOR = 'competitor',
  BUSINESS_MODEL = 'business_model',
  REVENUE = 'revenue',
  TECH_STACK = 'tech_stack',
  ARCHITECTURE = 'architecture',
  DATABASE = 'database',
  API_PLAN = 'api_plan',
  FRONTEND = 'frontend',
  BACKEND = 'backend',
  MARKETING = 'marketing',
  BUDGET = 'budget',
  ROADMAP = 'roadmap',
  RISKS = 'risks',
  SWOT = 'swot',
  PITCH_DECK = 'pitch_deck',
  TASKS = 'tasks',
  RESEARCH = 'research',
  INSIGHT = 'insight',
  TABLE = 'table',
  TIMELINE = 'timeline',
  DIAGRAM = 'diagram',
  TEXT = 'text',
}

export class CreateNodeDto {
  @IsEnum(NodeType)
  type: NodeType;

  @IsString()
  title: string;

  @IsOptional()
  content?: any;

  @IsOptional()
  position?: { x: number; y: number };

  @IsNumber()
  @IsOptional()
  width?: number;

  @IsNumber()
  @IsOptional()
  height?: number;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsObject()
  @IsOptional()
  style?: Record<string, any>;
}
