import {
    Controller,
    Body,
    InternalServerErrorException,
    Post,
    HttpCode,
    HttpStatus,
    Get,
    Delete,
    Param,
    NotFoundException,
    BadRequestException,
    Put,
} from '@nestjs/common';
import { ApiUseTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { TodoService } from './todo.service';
import { MapperService } from '../shared/mapping/mapper.service';
import { TodoParams } from './models/todo-params.model';
import { TodoVm } from './models/todo-vm.model';
import { Todo } from './models/todo.model';
import { ApiException } from '../shared/shared.model';

@Controller('todos')
@ApiUseTags('Todo')
export class TodoController {
    constructor(private readonly _todoService: TodoService, private readonly _mapperService: MapperService) {}

    @Post('create')
    @HttpCode(200)
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Create todo successful',
        type: TodoVm,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Bad request',
        type: ApiException,
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Unexpected Server error occurred',
        type: ApiException,
    })
    @ApiOperation({
        title: 'POST Create new Todo',
        operationId: 'Todo_CreateTodo',
    })
    async createTodo(@Body() todoParams: TodoParams): Promise<TodoVm> {
        let todo: Todo;
        try {
            todo = await this._todoService.createFromRequestBody(todoParams);
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
        return this._mapperService.mapper.map(
            this._todoService.modelName,
            this._todoService.viewModelName,
            todo.toJSON(),
        );
    }

    @Get()
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Get todos successful',
        type: TodoVm,
        isArray: true,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Bad request',
        type: ApiException,
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Unexpected Server error occurred',
        type: ApiException,
    })
    @ApiOperation({
        title: 'GET Get Todos',
        operationId: 'Todo_GetTodos',
    })
    async getAllTodos(): Promise<TodoVm[]> {
        let todos: Todo[];
        try {
            todos = await this._todoService.getAll();
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
        return this._mapperService.mapper.map(
            `${this._todoService.modelName}[]`,
            `${this._todoService.viewModelName}[]`,
            todos.map(todo => todo.toJSON()),
        );
    }

    @Delete(':id')
    @HttpCode(200)
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Delete todo successful',
        type: TodoVm,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Bad request',
        type: ApiException,
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Unexpected Server error occurred',
        type: ApiException,
    })
    @ApiOperation({
        title: 'DELETE Delete Todo',
        operationId: 'Todo_DeleteTodo',
    })
    async deleteTodo(@Param('id') id: string): Promise<TodoVm> {
        try {
            const todo: Todo = await this._todoService.delete(id);
            return this._mapperService.mapper.map(
                this._todoService.modelName,
                this._todoService.viewModelName,
                todo.toJSON(),
            );
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
    }

    @Get(':id')
    @HttpCode(200)
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Get todo successful',
        type: TodoVm,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Bad request',
        type: ApiException,
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Unexpected Server error occurred',
        type: ApiException,
    })
    @ApiOperation({
        title: 'GET Get Todo',
        operationId: 'Todo_GetTodoById',
    })
    async getTodoById(@Param('id') id: string): Promise<TodoVm> {
        try {
            const todo: Todo = await this._todoService.getById(id);
            return this._mapperService.mapper.map(
                this._todoService.modelName,
                this._todoService.viewModelName,
                todo.toJSON(),
            );
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
    }

    @Put()
    @HttpCode(200)
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Update todo successful',
        type: TodoVm,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Bad request',
        type: ApiException,
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Unexpected Server error occurred',
        type: ApiException,
    })
    @ApiOperation({
        title: 'PUT Update Todo',
        operationId: 'Todo_UpdateTodo',
    })
    async updateTodo(@Body() todo: TodoVm): Promise<TodoVm> {
        const existed: Todo = await this._todoService.getById(todo.id);
        if (!existed) throw new NotFoundException(`Not found ${todo.id}`);
        if (existed.isCompleted) throw new BadRequestException('Todo already completed');

        try {
            const updated: Todo = await this._todoService.updateFromRequestBody(todo);
            return this._mapperService.mapper.map(
                this._todoService.modelName,
                this._todoService.viewModelName,
                updated.toJSON(),
            );
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
    }
}