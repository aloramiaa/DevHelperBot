import { EmbedBuilder } from 'discord.js';
import Todo from '../../models/Todo.js';

export const data = {
  name: 'todo',
  description: 'Manage your todo list',
  aliases: ['task'],
  usage: '[add/list/complete/remove] [task description]',
  args: true,
  guildOnly: true
};

export const execute = async (message, args = []) => {
  const subCommand = args[0]?.toLowerCase();
  
  if (!subCommand || !['add', 'list', 'complete', 'remove'].includes(subCommand)) {
    return message.reply(
      `Invalid command. Use one of: \`${message.client.prefix}todo add "task"\`, \`${message.client.prefix}todo list\`, \`${message.client.prefix}todo complete [id]\`, \`${message.client.prefix}todo remove [id]\``
    );
  }

  try {
    switch (subCommand) {
      case 'add':
        return await addTodo(message, args.slice(1).join(' '));
      case 'list':
        return await listTodos(message);
      case 'complete':
        return await completeTodo(message, args[1]);
      case 'remove':
        return await removeTodo(message, args[1]);
    }
  } catch (error) {
    console.error('Todo command error:', error);
    message.reply('An error occurred while managing your todos. Please try again later.');
  }
};

// Add a new todo
async function addTodo(message, taskDescription) {
  if (!taskDescription) {
    return message.reply('Please provide a task description. Example: `!todo add "Fix API bug"`');
  }
  
  // Remove quotes if present
  const task = taskDescription.replace(/^["'](.+(?=["']$))["']$/, '$1');
  
  const newTodo = new Todo({
    userId: message.author.id,
    serverId: message.guild.id,
    task: task
  });
  
  await newTodo.save();
  
  return message.reply(`✅ Added todo: "${task}"`);
}

// List all todos
async function listTodos(message) {
  const todos = await Todo.find({
    userId: message.author.id,
    serverId: message.guild.id
  }).sort({ createdAt: 'asc' });
  
  if (todos.length === 0) {
    return message.reply('You have no todos. Add one with `!todo add "Your task"`');
  }
  
  const embed = new EmbedBuilder()
    .setTitle('📝 Your Todo List')
    .setColor('#0099ff')
    .setFooter({ text: 'DevHelper Bot', iconURL: message.client.user.displayAvatarURL() })
    .setTimestamp();
  
  todos.forEach((todo, index) => {
    embed.addFields({
      name: `${index + 1}. ${todo.completed ? '✅' : '⬜'} ${todo._id.toString().slice(-4)}`,
      value: todo.task
    });
  });
  
  return message.reply({ embeds: [embed] });
}

// Mark a todo as complete
async function completeTodo(message, idOrIndex) {
  if (!idOrIndex) {
    return message.reply('Please provide the ID or number of the todo to complete. Example: `!todo complete 1`');
  }
  
  const todos = await Todo.find({
    userId: message.author.id,
    serverId: message.guild.id
  }).sort({ createdAt: 'asc' });
  
  if (todos.length === 0) {
    return message.reply('You have no todos to complete.');
  }
  
  let todo;
  
  // Check if input is a number (index) or ID
  if (!isNaN(idOrIndex) && parseInt(idOrIndex) > 0 && parseInt(idOrIndex) <= todos.length) {
    // It's an index
    todo = todos[parseInt(idOrIndex) - 1];
  } else {
    // It's an ID or ID fragment
    todo = todos.find(t => t._id.toString().endsWith(idOrIndex));
  }
  
  if (!todo) {
    return message.reply('Todo not found. Use `!todo list` to see your todos.');
  }
  
  todo.completed = !todo.completed;
  await todo.save();
  
  return message.reply(`${todo.completed ? '✅ Marked' : '⬜ Unmarked'} todo as ${todo.completed ? 'completed' : 'incomplete'}: "${todo.task}"`);
}

// Remove a todo
async function removeTodo(message, idOrIndex) {
  if (!idOrIndex) {
    return message.reply('Please provide the ID or number of the todo to remove. Example: `!todo remove 1`');
  }
  
  const todos = await Todo.find({
    userId: message.author.id,
    serverId: message.guild.id
  }).sort({ createdAt: 'asc' });
  
  if (todos.length === 0) {
    return message.reply('You have no todos to remove.');
  }
  
  let todo;
  
  // Check if input is a number (index) or ID
  if (!isNaN(idOrIndex) && parseInt(idOrIndex) > 0 && parseInt(idOrIndex) <= todos.length) {
    // It's an index
    todo = todos[parseInt(idOrIndex) - 1];
  } else {
    // It's an ID or ID fragment
    todo = todos.find(t => t._id.toString().endsWith(idOrIndex));
  }
  
  if (!todo) {
    return message.reply('Todo not found. Use `!todo list` to see your todos.');
  }
  
  await Todo.deleteOne({ _id: todo._id });
  
  return message.reply(`🗑️ Removed todo: "${todo.task}"`);
} 