class_name Interactable
extends Area2D

@export var prompt_text: String = "Naciśnij Z"
@export var interaction_enabled: bool = true

@onready var prompt_label: Label = $PromptLabel
@onready var visual: ColorRect = $Visual

var _player_inside: bool = false


func _ready() -> void:
	body_entered.connect(_on_body_entered)
	body_exited.connect(_on_body_exited)
	if prompt_label:
		prompt_label.text = prompt_text
		prompt_label.visible = false
	collision_layer = 0
	collision_mask = 2
	monitoring = true
	monitorable = false


func _on_body_entered(body: Node2D) -> void:
	if not body.is_in_group("player"):
		return
	_player_inside = true
	if prompt_label and interaction_enabled:
		prompt_label.visible = true
	if body.has_method("register_interactable"):
		body.register_interactable(self)


func _on_body_exited(body: Node2D) -> void:
	if not body.is_in_group("player"):
		return
	_player_inside = false
	if prompt_label:
		prompt_label.visible = false
	if body.has_method("unregister_interactable"):
		body.unregister_interactable(self)


func on_interact(_player: Node) -> void:
	if not interaction_enabled:
		return
	_on_interact(_player)


func _on_interact(_player: Node) -> void:
	pass
